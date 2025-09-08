// src/lib/constants.ts
export const CONTRACTS = {
  VAULT_MANAGER: import.meta.env.VITE_VAULT_MANAGER_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-manager',
  TIME_LOCK_CONTROLLER: import.meta.env.VITE_TIME_LOCK_CONTROLLER_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.time-lock-controller',
  ORACLE_INTEGRATION: import.meta.env.VITE_ORACLE_INTEGRATION_CONTRACT || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.oracle-integration',
} as const;

export const NETWORK_CONFIG = {
  network: import.meta.env.VITE_NETWORK || 'testnet',
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.testnet.hiro.so',
} as const;
