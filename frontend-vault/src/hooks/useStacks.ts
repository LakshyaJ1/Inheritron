// src/hooks/useStacks.ts
import { useState, useEffect, useCallback } from 'react';
import {
  connect,
  disconnect,
  isConnected,
  request,
  getLocalStorage,
} from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import type { ClarityValue } from '@stacks/transactions';
import type { User, Transaction } from '../types';
import { CONTRACTS, NETWORK_CONFIG } from '../lib/constants';

// Template-literal contract id type required by request('stx_callContract')
type ContractId = `${string}.${string}`;

// 'mainnet' | 'testnet'
const NETWORK = (NETWORK_CONFIG?.network === 'mainnet' ? 'mainnet' : 'testnet') as
  | 'mainnet'
  | 'testnet';

export function useStacks() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get current STX address persisted by Connect v8
  const getCurrentStxAddress = useCallback(() => {
    try {
      const data = getLocalStorage();
      const stxArray = (data as any)?.addresses?.stx as Array<{ address: string }> | undefined;
      return stxArray?.[0]?.address ?? '';
    } catch (e) {
      console.warn('Failed to get STX address from local storage:', e);
      return '';
    }
  }, []);

  // Seed user if wallet already connected
  useEffect(() => {
    if (isConnected()) {
      const addr = getCurrentStxAddress();
      if (addr) {
        // Minimal fill to satisfy your User type
        setUser({
          stxAddress: addr,
          appPrivateKey: '',
          coreSessionToken: '',
          authResponseToken: '',
          decentralizedID: '',
          identityAddress: '',
          profile: {},
        });
      }
    }
  }, [getCurrentStxAddress]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await connect();

      if (isConnected()) {
        const addr = getCurrentStxAddress();
        if (!addr) throw new Error('No STX address found after connection');
        setUser({
          stxAddress: addr,
          appPrivateKey: '',
          coreSessionToken: '',
          authResponseToken: '',
          decentralizedID: '',
          identityAddress: '',
          profile: {},
        });
        console.log('Wallet connected:', addr);
      } else {
        throw new Error('Connection failed or cancelled');
      }
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to connect wallet';
      setError(msg);
      console.error('Wallet connection error:', e);
    } finally {
      setLoading(false);
    }
  }, [getCurrentStxAddress]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
      await disconnect();
    } catch (e) {
      console.warn('Disconnect error:', e);
    } finally {
      setUser(null);
      setTransactions([]);
      setError(null);
      setLoading(false);
    }
  }, []);

  // Core contract-call helper
  const callContract = useCallback(
    async (
      contractAddress: string,
      contractName: string,
      functionName: string,
      functionArgs: ClarityValue[],
      onSuccess?: (txId: string) => void,
      onError?: (message: string) => void
    ) => {
      if (!isConnected() || !user) {
        const msg = 'Please connect your wallet first';
        setError(msg);
        onError?.(msg);
        return;
      }

      setLoading(true);
      setError(null);

      const baseTx: Transaction = {
        txId: '',
        status: 'pending',
        functionName,
        timestamp: Date.now(),
      };

      try {
        // 👇 assert to the template-literal type `${string}.${string}`
        const contractIdentifier = `${contractAddress}.${contractName}` as ContractId;

        console.log('Calling contract:', {
          contract: contractIdentifier,
          functionName,
          argCount: functionArgs.length,
          network: NETWORK,
        });

        const res = await request('stx_callContract', {
          contract: contractIdentifier,
          functionName,
          functionArgs: [...functionArgs], // ensure mutable array
          network: NETWORK,
        });

        const txId: string = (res as { txid?: string }).txid ?? '';
        if (!txId) throw new Error('No transaction ID returned by wallet');

        const completedTx: Transaction = {
          ...baseTx,
          txId,
          status: 'success',
        };

        setTransactions((prev): Transaction[] => [completedTx, ...prev]);
        onSuccess?.(txId);
        console.log('Contract call success:', txId);
        return txId;
      } catch (e: any) {
        const message = e?.message ?? 'Contract call failed';
        const failedTx: Transaction = {
          ...baseTx,
          status: 'failed',
          error: message,
        };
        setTransactions((prev): Transaction[] => [failedTx, ...prev]);
        setError(message);
        onError?.(message);
        console.error('Contract call failed:', e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // High-level wrappers

  const createVault = useCallback(
    async (
      beneficiaries: string[],
      bitcoinAddress: string,
      amount: number,
      timeDelay: number,
      proofOfLifeInterval: number,
      percentages: number[],
      emergencyContacts: string[] = []
    ) => {
      if (!CONTRACTS.VAULT_MANAGER) {
        throw new Error('Vault manager contract address not configured');
      }

      console.log('Creating vault:', {
        beneficiaries,
        bitcoinAddress,
        amount,
        timeDelay,
        proofOfLifeInterval,
        percentages,
        emergencyContacts,
      });

      const args: ClarityValue[] = [
        Cl.list(beneficiaries.map(addr => Cl.principal(addr))),
        Cl.stringAscii(bitcoinAddress),
        Cl.uint(amount),
        Cl.uint(timeDelay),
        Cl.uint(proofOfLifeInterval),
        Cl.list(percentages.map(p => Cl.uint(p))),
        Cl.list(emergencyContacts.map(addr => Cl.principal(addr))),
      ];

      const [addr, name] = CONTRACTS.VAULT_MANAGER.split('.');
      return callContract(
        addr,
        name,
        'create-vault',
        args,
        txId => console.log('Vault creation tx:', txId),
        err => console.error('Vault creation failed:', err)
      );
    },
    [callContract]
  );

  const simulateActivityBurst = useCallback(
    async (vaultId: number) => {
      if (!CONTRACTS.ORACLE_INTEGRATION) {
        throw new Error('Oracle integration contract address not configured');
      }
      const [addr, name] = CONTRACTS.ORACLE_INTEGRATION.split('.');
      return callContract(addr, name, 'simulate-activity-burst', [Cl.uint(vaultId)]);
    },
    [callContract]
  );

  const simulateDeath = useCallback(
    async (vaultId: number) => {
      if (!CONTRACTS.TIME_LOCK_CONTROLLER) {
        throw new Error('Time lock controller contract address not configured');
      }
      const [addr, name] = CONTRACTS.TIME_LOCK_CONTROLLER.split('.');
      return callContract(addr, name, 'simulate-death', [Cl.uint(vaultId)]);
    },
    [callContract]
  );

  const claimInheritance = useCallback(
    async (vaultId: number) => {
      if (!CONTRACTS.VAULT_MANAGER) {
        throw new Error('Vault manager contract address not configured');
      }
      const [addr, name] = CONTRACTS.VAULT_MANAGER.split('.');
      return callContract(addr, name, 'claim-inheritance', [Cl.uint(vaultId)]);
    },
    [callContract]
  );

  return {
    // state
    user,
    loading,
    transactions,
    error,
    isConnected: !!user && isConnected(),

    // actions
    connectWallet,
    disconnectWallet,
    callContract,

    // contract functions
    createVault,
    simulateActivityBurst,
    simulateDeath,
    claimInheritance,
  };
}
