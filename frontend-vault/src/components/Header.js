// src/components/Header.js
import React from 'react';
import { Shield } from 'lucide-react';
import { useStacks } from '../hooks/useStacks';

function Header({ currentPage, onPageChange }) {
  const { user, isConnected, connectWallet, disconnectWallet, loading } = useStacks();

  const navigation = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Create Vault', id: 'create' },
    { name: 'Demo', id: 'demo' },
  ];

  const handleNavClick = (pageId) => {
    console.log('Nav clicked:', pageId); // Debug log
    onPageChange(pageId);
  };

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Bitcoin Vault</h1>
              <p className="text-xs text-white/60">Secure Your Legacy</p>
            </div>
          </div>

          {/* Navigation */}
          {isConnected && (
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          )}

          {/* Wallet */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {user?.stxAddress?.slice(0, 6)}...{user?.stxAddress?.slice(-4)}
                  </div>
                  <div className="text-xs text-white/60">Connected</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
