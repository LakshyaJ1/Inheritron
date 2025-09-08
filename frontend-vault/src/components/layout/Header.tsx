// src/components/Header.tsx
import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { useStacks } from '../../hooks/useStacks';
interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Header({ currentPage, onPageChange }: HeaderProps) {
  const { user, isConnected, connectWallet, disconnectWallet, loading } = useStacks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Create Vault', id: 'create' },
    { name: 'Demo', id: 'demo' },
  ];

  const handleNavClick = (pageId: string) => {
    console.log('Navigation clicked:', pageId);
    onPageChange(pageId);
    setMobileMenuOpen(false);
  };

  const handleConnect = async () => {
    console.log('Connect button clicked');
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    console.log('Disconnect button clicked');
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavClick(isConnected ? 'dashboard' : 'landing')}
          >
            <Shield className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Bitcoin Vault</h1>
              <p className="text-xs text-white/60">Secure Your Legacy</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isConnected && (
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {isConnected && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-white">
                    {user.stxAddress.slice(0, 6)}...{user.stxAddress.slice(-4)}
                  </div>
                  <div className="text-xs text-white/60">Connected</div>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="btn-secondary text-sm"
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary"
              >
                <Shield className="w-4 h-4" />
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile menu button */}
            {isConnected && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
