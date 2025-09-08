;; contracts/vault-manager.clar
;; Bitcoin Inheritance Time-Vault Protocol - Full Featured Vault Manager

;; -------------------------
;; Constants and Error Codes
;; -------------------------
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-VAULT-NOT-FOUND (err u404))
(define-constant ERR-INVALID-BENEFICIARY (err u400))
(define-constant ERR-VAULT-ALREADY-TRIGGERED (err u409))
(define-constant ERR-INVALID-PERCENTAGES (err u402))
(define-constant ERR-TOO-MANY-BENEFICIARIES (err u403))
(define-constant ERR-INSUFFICIENT-BALANCE (err u406))

;; -------------
;; Data Variables
;; -------------
(define-data-var vault-counter uint u0)
(define-data-var oracle-address principal tx-sender)
(define-data-var contract-owner principal tx-sender)

(define-data-var current-vault-id uint u0)

;; ----------------------------
;; Enhanced Vault Data Structure
;; ----------------------------
(define-map vaults
  { vault-id: uint }
  {
    owner: principal,
    beneficiaries: (list 5 principal),
    bitcoin-address: (string-ascii 64),
    total-amount: uint,
    creation-time: uint,
    unlock-conditions: {
      time-delay: uint,
      proof-of-life-interval: uint,
      minimum-confirmations: uint,
      emergency-contacts: (list 2 principal)
    },
    status: (string-ascii 20),
    distribution-percentages: (list 5 uint),
    vault-type: (string-ascii 20)
  }
)

;; ----------------------
;; Vault Balance Tracking
;; ----------------------
(define-map vault-balances
  { vault-id: uint }
  {
    deposited: uint,
    available: uint,
    distributed: uint
  }
)

;; ---------------------------
;; Beneficiary Status Tracking
;; ---------------------------
(define-map beneficiary-claims
  { vault-id: uint, beneficiary: principal }
  {
    claim-status: (string-ascii 20),
    claimed-amount: uint,
    claim-time: uint
  }
)

;; --------------------
;; Create Enhanced Vault
;; --------------------
(define-public (create-vault
  (beneficiaries (list 5 principal))
  (bitcoin-addr (string-ascii 64))
  (amount uint)
  (time-delay uint)
  (proof-interval uint)
  (percentages (list 5 uint))
  (emergency-contacts (list 2 principal))
)
  (let (
    (vault-id (+ (var-get vault-counter) u1))
    (total-percentage (fold + percentages u0))
  )
    (begin
      ;; Validate inputs
      (asserts! (> amount u0) ERR-INSUFFICIENT-BALANCE)
      (asserts! (> time-delay u0) ERR-INVALID-BENEFICIARY)
      (asserts! (> proof-interval u0) ERR-INVALID-BENEFICIARY)
      (asserts! (is-eq total-percentage u100) ERR-INVALID-PERCENTAGES)
      (asserts! (is-eq (len beneficiaries) (len percentages)) ERR-INVALID-BENEFICIARY)
      (asserts! (<= (len beneficiaries) u5) ERR-TOO-MANY-BENEFICIARIES)

      ;; Create vault
      (map-set vaults
        { vault-id: vault-id }
        {
          owner: tx-sender,
          beneficiaries: beneficiaries,
          bitcoin-address: bitcoin-addr,
          total-amount: amount,
          creation-time: burn-block-height,
          unlock-conditions: {
            time-delay: time-delay,
            proof-of-life-interval: proof-interval,
            minimum-confirmations: u3,
            emergency-contacts: emergency-contacts
          },
          status: "active",
          distribution-percentages: percentages,
          vault-type: "inheritance"
        }
      )

      ;; Initialize vault balance
      (map-set vault-balances
        { vault-id: vault-id }
        {
          deposited: amount,
          available: amount,
          distributed: u0
        }
      )

      ;; Initialize beneficiary claims
      ;; 1) set the context vault id
      (var-set current-vault-id vault-id)
      ;; 2) map over beneficiaries and percentages (must be lists of equal length)
      (map initialize-beneficiary-claim beneficiaries percentages)

      ;; Update counter
      (var-set vault-counter vault-id)

      ;; Emit creation event
      (print {
        event: "vault-created",
        vault-id: vault-id,
        owner: tx-sender,
        beneficiaries: beneficiaries,
        amount: amount,
        time-delay: time-delay,
        proof-interval: proof-interval
      })

      (ok vault-id)
    )
  )
)

;; -------------------------------------------------------
;; Helper: initialize a single beneficiary's claim record
;; Signature matches `(map ...)` over two lists:
;;    (beneficiary principal) and (percentage uint)
;; -------------------------------------------------------
(define-private (initialize-beneficiary-claim
  (beneficiary principal)
  (percentage uint)
)
  (begin
    (map-set beneficiary-claims
      {
        vault-id: (var-get current-vault-id),
        beneficiary: beneficiary
      }
      {
        claim-status: "pending",
        claimed-amount: u0,
        claim-time: u0
      }
    )
    true
  )
)

;; ----------------------
;; Update Vault Status
;; ----------------------
(define-public (update-vault-status (vault-id uint) (new-status (string-ascii 20)))
  (let (
    (vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
  )
    (begin
      ;; Only oracle, owner, or contract owner can update status
      (asserts!
        (or
          (is-eq tx-sender (get owner vault))
          (is-eq tx-sender (var-get oracle-address))
          (is-eq tx-sender (var-get contract-owner))
        )
        ERR-NOT-AUTHORIZED
      )

      ;; Update status
      (map-set vaults
        { vault-id: vault-id }
        (merge vault { status: new-status })
      )

      ;; Emit status change event
      (print {
        event: "vault-status-updated",
        vault-id: vault-id,
        old-status: (get status vault),
        new-status: new-status,
        updater: tx-sender
      })

      (ok true)
    )
  )
)

;; -----------------------
;; Claim Inheritance (beneficiary)
;; -----------------------
(define-public (claim-inheritance (vault-id uint))
  (let (
    (vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
    (claim (map-get? beneficiary-claims { vault-id: vault-id, beneficiary: tx-sender }))
    (vault-balance (unwrap! (map-get? vault-balances { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
  )
    (begin
      ;; Verify vault is triggered and sender is beneficiary
      (asserts! (is-eq (get status vault) "triggered") ERR-NOT-AUTHORIZED)
      (asserts! (is-some claim) ERR-NOT-AUTHORIZED)

      (let (
        (claim-data (unwrap-panic claim))
        (beneficiary-index (index-of (get beneficiaries vault) tx-sender))
        (percentage (unwrap!
          (element-at (get distribution-percentages vault)
                      (unwrap! beneficiary-index ERR-INVALID-BENEFICIARY))
          ERR-INVALID-BENEFICIARY))
        (claim-amount (/ (* (get available vault-balance) percentage) u100))
      )
        (begin
          ;; Verify not already claimed
          (asserts! (is-eq (get claim-status claim-data) "pending") ERR-VAULT-ALREADY-TRIGGERED)

          ;; Update claim status
          (map-set beneficiary-claims
            { vault-id: vault-id, beneficiary: tx-sender }
            {
              claim-status: "claimed",
              claimed-amount: claim-amount,
              claim-time: burn-block-height
            }
          )

          ;; Update vault balance
          (map-set vault-balances
            { vault-id: vault-id }
            (merge vault-balance {
              available: (- (get available vault-balance) claim-amount),
              distributed: (+ (get distributed vault-balance) claim-amount)
            })
          )

          ;; Emit claim event
          (print {
            event: "inheritance-claimed",
            vault-id: vault-id,
            beneficiary: tx-sender,
            amount: claim-amount,
            percentage: percentage
          })

          (ok claim-amount)
        )
      )
    )
  )
)

;; -----------------
;; Read-only helpers
;; -----------------
(define-read-only (get-vault (vault-id uint))
  (map-get? vaults { vault-id: vault-id })
)

(define-read-only (get-vault-balance (vault-id uint))
  (map-get? vault-balances { vault-id: vault-id })
)

(define-read-only (get-beneficiary-claim (vault-id uint) (beneficiary principal))
  (map-get? beneficiary-claims { vault-id: vault-id, beneficiary: beneficiary })
)

(define-read-only (get-vault-count)
  (var-get vault-counter)
)

(define-read-only (get-vaults-by-owner (owner principal))
  ;; Placeholder; real impl would iterate indexes
  (ok (list u1 u2 u3))
)

(define-read-only (get-vaults-by-beneficiary (beneficiary principal))
  ;; Placeholder; real impl would iterate indexes
  (ok (list u1 u2))
)

;; -------------------
;; Emergency functions
;; -------------------
(define-public (emergency-override
  (vault-id uint)
  (emergency-code (string-ascii 64))
)
  (let (
    (vault (unwrap! (map-get? vaults { vault-id: vault-id }) ERR-VAULT-NOT-FOUND))
  )
    (begin
      ;; Verify emergency conditions (simplified for demo)
      (asserts! (is-eq (get status vault) "active") ERR-VAULT-ALREADY-TRIGGERED)

      ;; Update to emergency triggered status
      (try! (update-vault-status vault-id "emergency-triggered"))

      (print {
        event: "emergency-override-activated",
        vault-id: vault-id,
        emergency-code: emergency-code,
        activator: tx-sender
      })

      (ok true)
    )
  )
)

;; --------------
;; Admin function
;; --------------
(define-public (set-oracle-address (new-oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set oracle-address new-oracle)
    (ok true)
  )
)

;; -------------------------------
;; Simple hello (compatibility)
;; -------------------------------
(define-public (say-hello)
  (ok "fdfd Hello from Enhanced Bitcoin Inheritance Vault!")
)
