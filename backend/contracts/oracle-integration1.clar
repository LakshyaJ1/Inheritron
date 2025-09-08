;; contracts/oracle-integration.clar
;; Proof-of-Life Oracle System for Inheritance Vaults

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-VAULT-NOT-FOUND (err u404))
(define-constant ERR-INVALID-CONFIDENCE (err u400))
(define-constant ERR-ORACLE-NOT-FOUND (err u405))
(define-constant ERR-LIST-TOO-LONG (err u500))

;; Admin / state
(define-data-var contract-owner principal tx-sender)
(define-data-var registry-initialized bool false)

;; Oracle management
(define-map authorized-oracles
    principal
    {
        active: bool,
        reputation-score: uint,
        total-updates: uint,
        last-activity: uint,
    }
)

;; Activity source definitions
(define-map activity-sources
    (string-ascii 50)
    {
        weight: uint,
        reliability: uint,
        last-update: uint,
    }
)

;; ---------------------------
;; One-time bootstrap (required)
;; ---------------------------
(define-public (init-registry)
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
        (asserts! (not (var-get registry-initialized)) ERR-NOT-AUTHORIZED)

        ;; Add deployer as first oracle
        (map-set authorized-oracles tx-sender {
            active: true,
            reputation-score: u100,
            total-updates: u0,
            last-activity: burn-block-height,
        })

        ;; Seed activity sources
        (map-set activity-sources "email" {
            weight: u25,
            reliability: u90,
            last-update: u0,
        })
        (map-set activity-sources "social-media" {
            weight: u20,
            reliability: u80,
            last-update: u0,
        })
        (map-set activity-sources "phone" {
            weight: u25,
            reliability: u85,
            last-update: u0,
        })
        (map-set activity-sources "banking" {
            weight: u20,
            reliability: u95,
            last-update: u0,
        })
        (map-set activity-sources "device" {
            weight: u10,
            reliability: u75,
            last-update: u0,
        })

        (var-set registry-initialized true)

        (print {
            event: "oracle-registry-initialized",
            owner: tx-sender,
        })
        (ok true)
    )
)

;; ---------------------------
;; Public: update proof of life (cleaned)
;; ---------------------------
(define-public (update-proof-of-life
        (vault-id uint)
        (activity-timestamp uint)
        (source (string-ascii 50))
        (confidence uint)
        (activity-data (string-ascii 200))
    )
    (let (
            (oracle-info (map-get? authorized-oracles tx-sender))
            (source-info (map-get? activity-sources source))
        )
        (begin
            (asserts!
                (and (is-some oracle-info) (get active (unwrap-panic oracle-info)))
                ERR-NOT-AUTHORIZED
            )
            (asserts! (and (>= confidence u0) (<= confidence u100))
                ERR-INVALID-CONFIDENCE
            )
            (asserts! (is-some source-info) ERR-ORACLE-NOT-FOUND)

            (let (
                    ;; weight the confidence by source reliability
                    (src-rel (get reliability (unwrap-panic source-info)))
                    (weighted-confidence (/ (* confidence src-rel) u100))
                )
                ;; Persist to controller (it will manage list caps & dedupe)
                (try! (contract-call? .time-lock-controller1 oracle-record-proof-of-life
                    vault-id activity-timestamp weighted-confidence source
                ))

                ;; Update oracle stats
                (map-set authorized-oracles tx-sender
                    (merge (unwrap-panic oracle-info) {
                        total-updates: (+ (get total-updates (unwrap-panic oracle-info)) u1),
                        last-activity: burn-block-height,
                    })
                )

                ;; Update source stats
                (map-set activity-sources source
                    (merge (unwrap-panic source-info) { last-update: burn-block-height })
                )

                (print {
                    event: "proof-of-life-updated",
                    vault-id: vault-id,
                    source: source,
                    confidence: confidence,
                    weighted-confidence: weighted-confidence,
                    activity-timestamp: activity-timestamp,
                    oracle: tx-sender,
                    activity-data: activity-data,
                    block-height: burn-block-height,
                })

                (ok {
                    vault-id: vault-id,
                    confidence: weighted-confidence,
                    source: source,
                    timestamp: activity-timestamp,
                })
            )
        )
    )
)

;; ---------------------------
;; Simulators (saturating math)
;; ---------------------------
(define-private (saturating-sub
        (a uint)
        (b uint)
    )
    (if (> a b)
        (- a b)
        u0
    )
)

(define-public (simulate-activity-burst (vault-id uint))
    (begin
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u10)
            "email" u85 "Sent email"
        ))
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u5)
            "social-media" u90 "Tweeted"
        ))
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u2)
            "phone" u95 "Called mom"
        ))
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u1)
            "banking" u100 "ATM withdrawal"
        ))

        (print {
            event: "activity-burst-simulated",
            vault-id: vault-id,
            sources-updated: u4,
        })
        (ok true)
    )
)

(define-public (simulate-activity-silence (vault-id uint))
    (begin
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u5000)
            "email" u10 "Old email"
        ))
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u5500)
            "social-media" u5 "Old social"
        ))
        (try! (update-proof-of-life vault-id (saturating-sub burn-block-height u6000)
            "phone" u0 "No calls"
        ))

        (print {
            event: "activity-silence-simulated",
            vault-id: vault-id,
        })
        (ok true)
    )
)

;; ---------------------------
;; Oracle management
;; ---------------------------
(define-public (add-oracle (oracle-address principal))
    (begin
        ;; Only owner can add oracles
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)

        (map-set authorized-oracles oracle-address {
            active: true,
            reputation-score: u75,
            total-updates: u0,
            last-activity: burn-block-height,
        })

        (print {
            event: "oracle-added",
            oracle: oracle-address,
            added-by: tx-sender,
        })
        (ok true)
    )
)

(define-public (set-oracle-active
        (oracle-address principal)
        (is-active bool)
    )
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
        (let ((info (unwrap! (map-get? authorized-oracles oracle-address)
                ERR-ORACLE-NOT-FOUND
            )))
            (map-set authorized-oracles oracle-address
                (merge info { active: is-active })
            )
        )
        (ok true)
    )
)

;; ---------------------------
;; Read-only helpers
;; ---------------------------
(define-read-only (get-oracle-info (oracle-address principal))
    (map-get? authorized-oracles oracle-address)
)

(define-read-only (get-activity-source-info (source (string-ascii 50)))
    (map-get? activity-sources source)
)

(define-read-only (is-authorized-oracle (oracle-address principal))
    (match (map-get? authorized-oracles oracle-address)
        some-oracle (get active some-oracle)
        false
    )
)

(define-read-only (is-initialized)
    (var-get registry-initialized)
)

(define-read-only (get-proof-of-life-summary (vault-id uint))
    (let (
            (proof-data (contract-call? .time-lock-controller1 get-proof-of-life vault-id))
            (inheritance-status (contract-call? .time-lock-controller1 get-inheritance-status vault-id))
        )
        {
            vault-id: vault-id,
            proof-data: proof-data,
            inheritance-status: inheritance-status,
            current-block: burn-block-height,
        }
    )
)
