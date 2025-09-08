// src/components/LandingPage.tsx
import React from 'react';
import { Shield, Zap, Users, Heart, ArrowRight } from 'lucide-react';
import { useStacks } from '../../hooks/useStacks';

export function LandingPage() {
  const { connectWallet, loading } = useStacks();

  const features = [
    {
      icon: Shield,
      title: 'Unhackable Security',
      description: 'Protected by Bitcoin\'s $1+ trillion network. Time-locks enforced by blockchain protocol.',
    },
    {
      icon: Zap,
      title: 'Automatic Transfer',
      description: 'Smart contracts detect death and automatically transfer Bitcoin to beneficiaries.',
    },
    {
      icon: Users,
      title: 'Multiple Beneficiaries',
      description: 'Support up to 5 beneficiaries with customizable percentage distributions.',
    },
    {
      icon: Heart,
      title: 'Emergency Override',
      description: 'Medical emergency codes and guardian keys for critical situations.',
    },
  ];

  const stats = [
    { number: '90%', label: 'Crypto holders accidentally disinherit families' },
    { number: '$100B+', label: 'Lost Bitcoin inheritance annually' },
    { number: '100%', label: 'Secure with Bitcoin finality' },
  ];

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Secure Your Bitcoin Legacy
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              The world's first fully decentralized, unhackable Bitcoin inheritance system. 
              Automatically transfer your Bitcoin to family when needed.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
            <div className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-lg font-medium">
              $100B+ Problem Solved
            </div>
            <div className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-lg font-medium">
              Bitcoin-Secured
            </div>
            <div className="px-6 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-lg font-medium">
              Fully Decentralized
            </div>
          </div>

          <div className="animate-slide-up">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="btn-primary text-xl px-8 py-4 shadow-2xl hover:shadow-primary-500/25 group hover:scale-105 transition-all duration-300"
            >
              <Shield className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {loading ? 'Connecting...' : 'Start Securing Your Legacy'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Revolutionary Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Built with cutting-edge blockchain technology to ensure your Bitcoin inheritance is secure and automatic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card text-center hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 rounded-full bg-primary-500/20 mb-4">
                  <feature.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-6 text-white">The Problem We Solve</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card text-center animate-slide-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-5xl font-bold mb-4 text-primary-400">
                  {stat.number}
                </div>
                <p className="text-white/80 leading-relaxed">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Secure Your Legacy?
          </h2>
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Join the revolution in Bitcoin inheritance. Protect your family's financial future with unhackable, automatic Bitcoin transfers.
          </p>
          
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-primary text-xl px-8 py-4 hover:scale-105 transition-transform"
          >
            <Shield className="w-6 h-6" />
            {loading ? 'Connecting...' : 'Get Started Now'}
          </button>
        </div>
      </section>
    </div>
  );
}
