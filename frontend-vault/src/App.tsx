// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { LandingPage } from './components/pages/LandingPages';
import { Dashboard } from './components/pages/Dashboard';
import { useStacks } from './hooks/useStacks';
import { CreateVault } from './components/CreateVault';
import Demo  from './components/Demo';

function App() {
  const { isConnected } = useStacks();
  const [currentPage, setCurrentPage] = useState('landing');

  // Auto-redirect based on wallet connection
  useEffect(() => {
    if (isConnected && currentPage === 'landing') {
      console.log('Wallet connected, redirecting to dashboard');
      setCurrentPage('dashboard');
    } else if (!isConnected && currentPage !== 'landing') {
      console.log('Wallet disconnected, redirecting to landing');
      setCurrentPage('landing');
    }
  }, [isConnected, currentPage]);

  const handlePageChange = (page: string) => {
    console.log('Page change requested:', page);
    if (!isConnected && page !== 'landing') {
      console.log('Cannot navigate to', page, 'without wallet connection');
      return;
    }
    setCurrentPage(page);
  };

  console.log('Current page:', currentPage, 'Connected:', isConnected);

  return (
    <div className="min-h-screen bg-hero">
      <Header currentPage={currentPage} onPageChange={handlePageChange} />
      
      <main>
        {currentPage === 'landing' && <LandingPage />}
        {currentPage === 'dashboard' && <Dashboard onPageChange={handlePageChange} />}
        {currentPage === 'create' && <CreateVault onPageChange={handlePageChange} />}
        {currentPage === 'demo' && <Demo onPageChange={handlePageChange} />}
      </main>
    </div>
  );
}

export default App;
