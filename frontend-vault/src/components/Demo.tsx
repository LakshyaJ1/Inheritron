// src/components/Demo.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface DemoProps {
  onPageChange: (page: string) => void;
}

function Demo({ onPageChange }: DemoProps) {
  const handleBack = (): void => {
    onPageChange('dashboard');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="btn-secondary mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="glass-card text-center py-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Interactive Demo
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Demo functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

export default Demo;
