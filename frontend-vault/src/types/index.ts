// src/types/index.ts
export interface User {
  stxAddress: string;
  appPrivateKey: string;
  coreSessionToken?: string;
  authResponseToken?: string;
  decentralizedID?: string;
  identityAddress?: string;
  profile?: any;
}

export interface Vault {
  id: number;
  owner: string;
  beneficiaries: string[];
  bitcoinAddress: string;
  totalAmount: number;
  creationTime: number;
  status: 'active' | 'triggered' | 'emergency-triggered' | 'distributed';
  distributionPercentages: number[];
  unlockConditions: {
    timeDelay: number;
    proofOfLifeInterval: number;
    minimumConfirmations: number;
    emergencyContacts: string[];
  };
  confidenceScore?: number;
  lastActivity?: number;
}

export interface Transaction {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  functionName: string;
  timestamp: number;
  error?: string;
}
