import React, { useState } from "react";
import { Plus, Shield, Users, TrendingUp, Activity } from "lucide-react";
import { VaultCard } from "../../components/layout/UI/VaultCard";

import { formatSTX } from "../../lib/utils";
import type { Vault } from "../../types";

// Props: onPageChange allows navigation to (e.g.) Create Vault page
interface DashboardProps {
  onPageChange: (page: string) => void;
}

export function Dashboard({ onPageChange }: DashboardProps) {
  // Mock demo data for testing, replace with backend/contract fetch later
  const [vaults] = useState<Vault[]>([
    {
      id: 1,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      beneficiaries: [
        "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
        "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
      ],
      bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      totalAmount: 2500000,
      creationTime: Date.now() - 86400000 * 5,
      status: "active",
      distributionPercentages: [70, 30],
      unlockConditions: {
        timeDelay: 4320,
        proofOfLifeInterval: 1440,
        minimumConfirmations: 3,
        emergencyContacts: [],
      },
      confidenceScore: 95,
      lastActivity: Date.now() - 3600000,
    },
    {
      id: 2,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      beneficiaries: ["ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ"],
      bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      totalAmount: 1500000,
      creationTime: Date.now() - 86400000 * 30,
      status: "triggered",
      distributionPercentages: [100],
      unlockConditions: {
        timeDelay: 4320,
        proofOfLifeInterval: 1440,
        minimumConfirmations: 3,
        emergencyContacts: [],
      },
      confidenceScore: 15,
      lastActivity: Date.now() - 86400000 * 10,
    },
  ]);

  const totalValue = vaults.reduce((sum, vault) => sum + vault.totalAmount, 0);
  const totalBeneficiaries = vaults.reduce(
    (sum, vault) => sum + vault.beneficiaries.length,
    0
  );
  const activeVaults = vaults.filter((v) => v.status === "active").length;
  const avgHealth =
    vaults.length > 0
      ? Math.round(vaults.reduce((sum, v) => sum + (v.confidenceScore || 0), 0) / vaults.length)
      : 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Your Inheritance Vaults
              </h1>
              <p className="text-white/70 text-lg">
                Manage and monitor your Bitcoin inheritance vaults
              </p>
            </div>
            <button
              onClick={() => onPageChange("create")}
              className="btn-primary text-lg px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              Create New Vault
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white/70 text-sm">Total Vaults</span>
            </div>
            <div className="text-3xl font-bold text-white">{vaults.length}</div>
            <p className="text-sm text-green-400 mt-1">{activeVaults} active</p>
          </div>
    
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-white/70 text-sm">Total Protected</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatSTX(totalValue)}
            </div>
            <p className="text-sm text-primary-400 mt-1">
              ≈ ${((totalValue / 1_000_000) * 0.5).toFixed(2)} USD
            </p>
          </div>
    
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-white/70 text-sm">Beneficiaries</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalBeneficiaries}</div>
            <p className="text-sm text-purple-400 mt-1">
              Protected family members
            </p>
          </div>
    
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white/70 text-sm">Avg Health</span>
            </div>
            <div className="text-3xl font-bold text-white">{avgHealth}%</div>
            <p className="text-sm text-green-400 mt-1">
              Proof-of-life score
            </p>
          </div>
        </div>

        {/* Vaults Grid */}
        {vaults.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-16 animate-slide-up">
            <Shield className="w-24 h-24 text-white/30 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No vaults yet</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Create your first inheritance vault to secure your Bitcoin legacy and protect your family's financial future
            </p>
            <button
              onClick={() => onPageChange("create")}
              className="btn-primary text-lg px-8 py-3"
            >
              <Plus className="w-5 h-5" />
              Create Your First Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
