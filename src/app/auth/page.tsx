'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Package, TrendingUp, Globe, Shield, Zap, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: Package, title: 'Smart Inventory', description: 'ABC analysis with AI-powered insights' },
  { icon: TrendingUp, title: 'Demand Forecasting', description: 'Advanced algorithms for prediction' },
  { icon: Globe, title: 'Global Tracking', description: 'Real-time shipment monitoring' },
];

const badges = [
  { icon: Shield, text: 'Enterprise Security' },
  { icon: Zap, text: 'Real-time Sync' },
  { icon: CheckCircle2, text: 'SAP Integration' },
];

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store auth token in localStorage
    localStorage.setItem('tenchi_auth', JSON.stringify({
      user: {
        id: '1',
        email: formData.email,
        name: formData.name || 'Admin User',
        role: 'admin',
      },
      token: 'mock-jwt-token',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }));

    setLoading(false);
    router.push('/');
  };

  const handleGuestLogin = () => {
    localStorage.setItem('tenchi_auth', JSON.stringify({
      user: {
        id: 'guest',
        email: 'guest@tenchi.com',
        name: 'Guest User',
        role: 'viewer',
      },
      token: 'guest-token',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      
      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative flex-col justify-between p-12"
      >
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TenchiOne</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wider">S&OP Platform</p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight"
          >
            Transform Your{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Supply Chain
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-400"
          >
            AI-powered Sales & Operations Planning platform for demand forecasting, 
            inventory optimization, and seamless supply chain management.
          </motion.p>

          <div className="grid gap-4 pt-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center gap-6 text-sm text-gray-500"
        >
          {badges.map((badge) => (
            <span key={badge.text} className="flex items-center gap-2">
              <badge.icon className="w-4 h-4" />
              {badge.text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TenchiOne</span>
          </div>

          {/* Auth Form */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isLogin ? 'Sign in to access your dashboard' : 'Get started with your free account'}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400">
                    <input type="checkbox" className="rounded border-slate-600 bg-slate-800" />
                    Remember me
                  </label>
                  <Link href="#" className="text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleGuestLogin}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
