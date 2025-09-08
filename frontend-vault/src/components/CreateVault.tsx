// src/components/CreateVault.tsx
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStacks } from '../hooks/useStacks';

interface CreateVaultProps {
  onPageChange: (page: string) => void;
}

export function CreateVault({ onPageChange }: CreateVaultProps) {
  const { createVault, loading, error } = useStacks();
  const [formData, setFormData] = useState({
    bitcoinAddress: '',
    amount: '',
    beneficiaries: [{ address: '', percentage: 100 }]
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    console.log('Back to dashboard clicked');
    onPageChange('dashboard');
  };

  const addBeneficiary = () => {
    if (formData.beneficiaries.length < 5) {
      const currentTotal = formData.beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
      const remaining = Math.max(0, 100 - currentTotal);
      
      setFormData({
        ...formData,
        beneficiaries: [...formData.beneficiaries, { address: '', percentage: remaining }]
      });
    }
  };

  const removeBeneficiary = (index: number) => {
    if (formData.beneficiaries.length > 1) {
      const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
      setFormData({ ...formData, beneficiaries: newBeneficiaries });
    }
  };

  const updateBeneficiary = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const newBeneficiaries = [...formData.beneficiaries];
    newBeneficiaries[index] = { 
      ...newBeneficiaries[index], 
      [field]: field === 'percentage' ? Number(value) : value 
    };
    setFormData({ ...formData, beneficiaries: newBeneficiaries });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Validation
      const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setMessage('❌ Percentages must add up to 100%');
        return;
      }

      const hasEmptyAddresses = formData.beneficiaries.some(b => !b.address.trim());
      if (hasEmptyAddresses) {
        setMessage('❌ All beneficiary addresses are required');
        return;
      }

      if (!formData.bitcoinAddress.trim()) {
        setMessage('❌ Bitcoin address is required');
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setMessage('❌ Valid amount is required');
        return;
      }

      setMessage('🔄 Creating vault... Please approve in your wallet.');

      const result = await createVault(
        formData.beneficiaries.map(b => b.address.trim()),
        formData.bitcoinAddress.trim(),
        Math.floor(parseFloat(formData.amount) * 1000000), // Convert to microSTX
        12960, // 90 days in blocks (144 blocks/day * 90)
        4320,  // 30 days in blocks (144 blocks/day * 30)
        formData.beneficiaries.map(b => b.percentage)
      );

      if (result) {
        setMessage(`✅ Vault created successfully! Transaction ID: ${result}`);
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            bitcoinAddress: '',
            amount: '',
            beneficiaries: [{ address: '', percentage: 100 }]
          });
          setMessage('');
          onPageChange('dashboard');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Vault creation error:', error);
      setMessage(`❌ Error: ${error.message || 'Failed to create vault'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <button
            onClick={handleBack}
            className="btn-secondary mb-4 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Inheritance Vault
          </h1>
          <p className="text-white/70 text-lg">
            Set up automatic Bitcoin inheritance for your family
          </p>
        </div>

        {/* Form */}
        <div className="glass-card animate-fade-in">
          {(message || error) && (
            <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg">
              <p className="text-white">{message || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bitcoin Address */}
            <div>
              <label className="block text-white font-medium mb-2">
                Bitcoin Address *
              </label>
              <input
                type="text"
                className="input"
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                value={formData.bitcoinAddress}
                onChange={(e) => setFormData({ ...formData, bitcoinAddress: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-white/50 mt-1">
                The Bitcoin address where your inheritance Bitcoin is stored
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-white font-medium mb-2">
                Amount (STX) *
              </label>
              <input
                type="number"
                step="0.000001"
                min="0.000001"
                className="input"
                placeholder="2.5"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-white/50 mt-1">
                Amount of STX to deposit as collateral for the vault
              </p>
            </div>

            {/* Beneficiaries */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-medium">
                  Beneficiaries *
                </label>
                <button
                  type="button"
                  onClick={addBeneficiary}
                  disabled={formData.beneficiaries.length >= 5 || isSubmitting}
                  className="btn-secondary text-sm hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  Add Beneficiary ({formData.beneficiaries.length}/5)
                </button>
              </div>

              <div className="space-y-4">
                {formData.beneficiaries.map((beneficiary, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-2">
                      <label className="block text-white/70 text-sm mb-1">
                        Stacks Address {index + 1}
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                        value={beneficiary.address}
                        onChange={(e) => updateBeneficiary(index, 'address', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-white/70 text-sm mb-1">
                        Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="input"
                        value={beneficiary.percentage}
                        onChange={(e) => updateBeneficiary(index, 'percentage', parseFloat(e.target.value) || 0)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    {formData.beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(index)}
                        className="btn-secondary p-2 hover:scale-105 transition-transform"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={`mt-2 text-sm font-medium ${Math.abs(totalPercentage - 100) > 0.01 ? 'text-red-400' : 'text-green-400'}`}>
                Total: {totalPercentage.toFixed(1)}% {Math.abs(totalPercentage - 100) > 0.01 && '(must equal 100%)'}
              </div>
            </div>

            {/* Vault Settings Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Default Vault Settings</h4>
              <div className="space-y-1 text-sm text-white/70">
                <p>• Time Lock: 90 days (vault triggers after 90 days of inactivity)</p>
                <p>• Proof-of-Life Check: Every 30 days</p>
                <p>• Network: Stacks Testnet</p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting || loading || Math.abs(totalPercentage - 100) > 0.01}
                className="btn-primary w-full text-lg py-3 hover:scale-105 transition-transform disabled:hover:scale-100"
              >
                {isSubmitting ? 'Creating Vault...' : 'Create Vault'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
