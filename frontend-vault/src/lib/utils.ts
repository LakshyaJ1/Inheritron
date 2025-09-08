import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSTX(microSTX: number): string {
  const stx = microSTX / 1_000_000;
  return `${stx.toFixed(2)} STX`;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'triggered':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'emergency-triggered':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'distributed':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    default:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

export function calculateTimeRemaining(creationTime: number, delayBlocks: number) {
  const delayMs = delayBlocks * 10 * 60 * 1000; // 10 minutes per block
  const expiryTime = creationTime + delayMs;
  const remaining = expiryTime - Date.now();
  
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, expired: false };
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
