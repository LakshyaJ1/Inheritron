import { Calendar, Users, Activity, Shield, Clock } from 'lucide-react';
import { formatSTX, getStatusColor, getHealthColor, formatAddress } from '../../../lib/utils';
import type { Vault } from '../../../types';
import type { Key } from 'react';

interface VaultCardProps {
  vault: Vault;
  onSelect?: (vault: Vault) => void;
}

export function VaultCard({ vault, onSelect }: VaultCardProps) {
  const healthScore = vault.confidenceScore || 85;

  return (
    <div 
      className="card cursor-pointer group"
      onClick={() => onSelect?.(vault)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Vault #{vault.id}
          </h3>
          <p className="text-white/60 text-sm">
            Created {new Date(vault.creationTime).toLocaleDateString()}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vault.status)}`}>
          {vault.status.toUpperCase()}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6">
        
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary-400" />
          <span className="text-white/70 text-sm">Protected Amount</span>
        </div>
        <p className="text-3xl font-bold text-white">
          {formatSTX(vault.totalAmount)}
        </p>
        <p className="text-white/50 text-sm">
          ≈ ${((vault.totalAmount / 1_000_000) * 0.5).toFixed(2)} USD
        </p>
      </div>

      {/* Health Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm">Health Score</span>
          </div>
          <span className={`font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              healthScore >= 80 ? 'bg-green-400' : 
              healthScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-sm">
              Beneficiaries ({vault.beneficiaries.length})
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {vault.beneficiaries.slice(0, 2).map((beneficiary: string, idx: number) => (
  <div key={idx} className="flex items-center justify-between text-sm">
    <span className="text-white/80 font-mono">
      {formatAddress(beneficiary)}
    </span>
    <span className="text-secondary-400 font-medium">
      {vault.distributionPercentages[idx]}%
    </span>
  </div>
))}

          
          {vault.beneficiaries.length > 2 && (
            <div className="text-xs text-white/50 text-center py-1">
              +{vault.beneficiaries.length - 2} more beneficiaries
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <button className="btn-secondary flex-1 text-sm py-2">
          View Details
        </button>
        <button className="btn-primary flex-1 text-sm py-2">
          Manage
        </button>
      </div>
    </div>
  );
}
