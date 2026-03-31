'use client';

import { Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Package, TrendingUp, Globe, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/nextjs';
import Link from 'next/link';

// Lazy-load Spline (heavy) with no SSR
const Spline = lazy(() => import('@splinetool/react-spline'));

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

const clerkAppearance = {
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: 'transparent',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorInputBackground: 'rgba(255,255,255,0.07)',
    colorInputText: '#f8fafc',
    colorDanger: '#f43f5e',
    borderRadius: '0.875rem',
  },
  elements: {
    card: 'shadow-none bg-transparent',
    headerTitle: 'text-2xl font-bold text-white',
    headerSubtitle: 'text-slate-400 text-sm',
    socialButtonsBlockButton:
      'bg-white/8 border border-white/15 text-white hover:bg-white/15 rounded-xl transition-all backdrop-blur-sm',
    socialButtonsBlockButtonText: 'text-white text-sm font-medium',
    formFieldLabel: 'text-sm font-medium text-slate-300',
    formFieldInput:
      'bg-white/8 border border-white/15 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/12 transition-all backdrop-blur-sm',
    formButtonPrimary:
      'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)]',
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
    otpCodeFieldInput: 'bg-white/8 border border-white/15 rounded-xl text-white',
    formResendCodeLink: 'text-indigo-400 hover:text-indigo-300',
    alternativeMethodsBlockButton: 'bg-white/8 border border-white/15 text-white hover:bg-white/15 rounded-xl',
    alternativeMethodsBlockButtonText: 'text-white',
  },
};

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">

      {/* ── Spline Galaxy Background ── */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          // Fallback gradient while Spline loads
          <div className="w-full h-full bg-gradient-to-br from-[#050810] via-[#0d0b1f] to-[#090518]" />
        }>
          <Spline
            style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
            scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
          />
        </Suspense>

        {/* Gradient vignette so card text stays readable */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%),
              linear-gradient(to right, rgba(0,0,0,0.6), transparent 35%, transparent 65%, rgba(0,0,0,0.6)),
              linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)
            `
          }}
        />
      </div>

      {/* ── Navbar strip ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">TenchiOne</span>
        </Link>
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          ← Back to home
        </Link>
      </div>

      {/* ── Content (centered on all screens) ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-20 pb-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 min-h-screen">

        {/* Left panel — branding (hidden on mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hidden lg:flex flex-col justify-center gap-8 flex-1 max-w-md"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-xs text-indigo-300 font-semibold tracking-wider mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-POWERED S&amp;OP PLATFORM
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight"
            >
              Transform Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Supply Chain
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 mt-4 leading-relaxed"
            >
              AI-powered demand forecasting, inventory optimization, and global logistics management — all in one platform.
            </motion.p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{f.description}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-4 text-xs text-slate-500"
          >
            {badges.map(b => (
              <span key={b.text} className="flex items-center gap-1.5">
                <b.icon className="w-3.5 h-3.5" /> {b.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right panel — Liquid Glass Clerk card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md flex-shrink-0"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TenchiOne</span>
          </div>

          {/* === Liquid Glass Card === */}
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              /* Multi-layer glass stack */
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.06) inset,
                0 8px 32px rgba(0,0,0,0.4),
                0 32px 80px rgba(0,0,0,0.3),
                0 0 60px rgba(99,102,241,0.12)
              `,
            }}
          >
            {/* Inner highlight rim */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)',
              }}
            />

            {/* Refraction blob */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'rgba(99,102,241,0.12)', filter: 'blur(50px)' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'rgba(139,92,246,0.08)', filter: 'blur(60px)' }}
            />

            <div className="relative z-10 p-7 sm:p-9">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
