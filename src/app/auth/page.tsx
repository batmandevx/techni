'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Package, TrendingUp, Globe, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/nextjs';

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
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  const clerkAppearance = {
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: 'transparent',
      colorText: '#f8fafc',
      colorTextSecondary: '#94a3b8',
      colorInputBackground: 'rgba(255,255,255,0.05)',
      colorInputText: '#f8fafc',
      colorDanger: '#f43f5e',
      borderRadius: '0.75rem',
    },
    elements: {
      card: 'shadow-none bg-transparent',
      headerTitle: 'text-2xl font-bold text-white',
      headerSubtitle: 'text-slate-400 text-sm',
      socialButtonsBlockButton:
        'bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl transition-all',
      socialButtonsBlockButtonText: 'text-white text-sm font-medium',
      formFieldLabel: 'text-sm font-medium text-slate-300',
      formFieldInput:
        'bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all',
      formButtonPrimary:
        'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-xl transition-all',
      footerActionText: 'text-slate-400',
      footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-medium',
      dividerLine: 'bg-white/10',
      dividerText: 'text-slate-500 text-xs',
      identityPreviewText: 'text-white',
      identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300',
      alertText: 'text-rose-400',
      alert: 'bg-rose-500/10 border border-rose-500/20 rounded-lg',
      formFieldErrorText: 'text-rose-400 text-xs',
      formFieldSuccessText: 'text-emerald-400 text-xs',
      otpCodeFieldInput: 'bg-white/5 border border-white/10 rounded-xl text-white',
      formResendCodeLink: 'text-indigo-400 hover:text-indigo-300',
      alternativeMethodsBlockButton:
        'bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl',
      alternativeMethodsBlockButtonText: 'text-white',
      signUp: {
        start: {
          headerTitle: 'text-2xl font-bold text-white',
          headerSubtitle: 'text-slate-400 text-sm',
        },
      },
    },
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

      {/* Right Panel - Clerk Auth */}
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

          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            {mode === 'sign-in' ? (
              <SignIn
                routing="hash"
                signUpUrl="/auth?mode=sign-up"
                appearance={clerkAppearance}
              />
            ) : (
              <SignUp
                routing="hash"
                signInUrl="/auth?mode=sign-in"
                appearance={clerkAppearance}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
