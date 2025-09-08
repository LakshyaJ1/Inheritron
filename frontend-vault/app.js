// src/App.js
import React, { useState, useEffect } from 'react';
import './index.css';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CreateVault from './components/CreateVault';
import Demo from './components/Demo';
import { useStacks } from './hooks/useStacks';

function App() {
  const { user, isConnected } = useStacks();
  const [currentPage, setCurrentPage] = useState('landing');

  // Auto-redirect based on wallet connection
  useEffect(() => {
    if (isConnected && currentPage === 'landing') {
      setCurrentPage('dashboard');
    } else if (!isConnected && currentPage !== 'landing') {
      setCurrentPage('landing');
    }
  }, [isConnected, currentPage]);

  const handlePageChange = (page) => {
    console.log('Changing page to:', page); // Debug log
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
      />
      
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
