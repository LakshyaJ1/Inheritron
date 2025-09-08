// src/components/Dashboard.js
import React, { useState } from 'react';
import { Plus, Shield, Users, TrendingUp, Activity } from 'lucide-react';

function Dashboard({ onPageChange }) {
  // Mock data - replace with real data later
  const [vaults] = useState([
    {
      id: 1,
      status: 'active',
      amount: 2500000, // microSTX
      beneficiaries: ['ST1SJ3...YPD5', 'ST2CY5...K9AG'],
      percentages: [70, 30],
      createdAt: new Date('2025-09-03').getTime(),
      confidenceScore: 95
    },
    {
      id: 2,
      status: 'triggered',
      amount: 1500000, // microSTX
      beneficiaries: ['ST3PF1...YGKJ'],
      percentages: [100],
      createdAt: new Date('2025-08-09').getTime(),
      confidenceScore: 15
    }
  ]);

  const handleCreateVault = () => {
    console.log('Create vault clicked'); // Debug log
    onPageChange('create');
  };

  const handleViewDetails = (vaultId) => {
    console.log('View details clicked for vault:', vaultId);
    // You can add a vault details page later
    alert(`Viewing details for Vault #${vaultId}`);
  };

  const handleManageVault = (vaultId) => {
    console.log('Manage vault clicked for vault:', vaultId);
    // You can add vault management functionality later
    alert(`Managing Vault #${vaultId}`);
  };

  // Calculate stats
  const totalValue = vaults.reduce((sum, vault) => sum + vault.amount, 0);
  const totalBeneficiaries = vaults.reduce((sum, vault) => sum + vault.beneficiaries.length, 0);
  const activeVaults = vaults.filter(v => v.status === 'active').length;
  const avgHealth = Math.round(vaults.reduce((sum, v) => sum + v.confidenceScore, 0) / vaults.length);

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
              onClick={handleCreateVault}
              className="btn-primary text-lg px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              Create New Vault
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-white/70 text-sm">Total Vaults</span>
            </div>
            <div className="text-3xl font-bold text-white">{vaults.length}</div>
            <p className="text-sm text-green-400 mt-1">{activeVaults} active</p>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary-400" />
              <span className="text-white/70 text-sm">Total Protected</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {(totalValue / 1000000).toFixed(2)} STX
            </div>
            <p className="text-sm text-primary-400 mt-1">
              ≈ ${((totalValue / 1000000) * 0.5).toFixed(2)} USD
            </p>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white/70 text-sm">Beneficiaries</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalBeneficiaries}</div>
            <p className="text-sm text-purple-400 mt-1">Protected family members</p>
          </div>

          <div className="glass-card">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-white/70 text-sm">Avg Health</span>
            </div>
            <div className="text-3xl font-bold text-white">{avgHealth}%</div>
            <p className="text-sm text-green-400 mt-1">Proof-of-life score</p>
          </div>
        </div>

        {/* Vault Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {vaults.map((vault) => (
            <div key={vault.id} className="glass-card">
              {/* Vault Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Vault #{vault.id}
                  </h3>
                  <p className="text-white/60 text-sm">
                    Created {new Date(vault.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vault.status === 'active' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                }`}>
                  {vault.status.toUpperCase()}
                </div>
              </div>

              {/* Protected Amount */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary-400" />
                  <span className="text-white/70 text-sm">Protected Amount</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {(vault.amount / 1000000).toFixed(2)} STX
                </p>
                <p className="text-white/50 text-sm">
                  ≈ ${((vault.amount / 1000000) * 0.5).toFixed(2)} USD
                </p>
              </div>

              {/* Health Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-white/70" />
                    <span className="text-white/70 text-sm">Health Score</span>
                  </div>
                  <span className={`font-bold ${
                    vault.confidenceScore >= 80 ? 'text-green-400' : 
                    vault.confidenceScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {vault.confidenceScore}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      vault.confidenceScore >= 80 ? 'bg-green-400' : 
                      vault.confidenceScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${vault.confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Beneficiaries */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-white/70" />
                  <span className="text-white/70 text-sm">
                    Beneficiaries ({vault.beneficiaries.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {vault.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-white/80 font-mono">{beneficiary}</span>
                      <span className="text-secondary-400 font-medium">
                        {vault.percentages[index]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <button 
                  className="btn-secondary flex-1 text-sm py-2"
                  onClick={() => handleViewDetails(vault.id)}
                >
                  View Details
                </button>
                <button 
                  className="btn-primary flex-1 text-sm py-2"
                  onClick={() => handleManageVault(vault.id)}
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
