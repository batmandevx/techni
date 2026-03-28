'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Upload, Package, BarChart3, 
  Database, Settings, FileSpreadsheet, Menu, X,
  ChevronRight, Sparkles, Zap, TrendingUp
} from 'lucide-react';
import LoadingScreen from '@/components/smartorder/LoadingScreen';

const navItems = [
  { href: '/smartorder', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
  { href: '/smartorder/upload', icon: Upload, label: 'Upload Orders', color: 'from-orange-500 to-amber-500' },
  { href: '/smartorder/orders', icon: Package, label: 'Order History', color: 'from-green-500 to-emerald-500' },
  { href: '/smartorder/analytics', icon: BarChart3, label: 'Analytics', color: 'from-purple-500 to-pink-500' },
];

const toolItems = [
  { href: '/smartorder/templates', icon: FileSpreadsheet, label: 'Templates', color: 'from-pink-500 to-rose-500' },
  { href: '/smartorder/master-data', icon: Database, label: 'Master Data', color: 'from-indigo-500 to-violet-500' },
  { href: '/smartorder/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
];

export default function SmartOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/smartorder') {
      return pathname === '/smartorder';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* TenchiOne Animated Loading Screen */}
      {loading && (
        <LoadingScreen 
          onComplete={() => setLoading(false)} 
          minDuration={4000}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Top Bar - Glassmorphism */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link href="/smartorder" className="flex items-center gap-3">
                {/* TenchiOne Mini Logo */}
                <motion.div 
                  className="relative w-10 h-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Blue infinity loop */}
                  <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00b8ff" />
                        <stop offset="100%" stopColor="#00d8ff" />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d4941a" />
                        <stop offset="100%" stopColor="#f0b840" />
                      </linearGradient>
                    </defs>
                    {/* Blue left loop */}
                    <path
                      d="M 50 30 C 50 10, 30 5, 20 15 C 10 25, 15 45, 30 45 C 40 45, 48 38, 50 30"
                      fill="none"
                      stroke="url(#blueGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 50 30 C 50 10, 30 5, 20 15 C 10 25, 15 45, 30 45 C 40 45, 48 38, 50 30"
                      fill="none"
                      stroke="url(#blueGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.3"
                      transform="scale(1.1) translate(-4.5, -2.7)"
                    />
                    {/* Gold right loop */}
                    <path
                      d="M 50 30 C 50 10, 70 5, 80 15 C 90 25, 85 45, 70 45 C 60 45, 52 38, 50 30"
                      fill="none"
                      stroke="url(#goldGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 50 30 C 50 10, 70 5, 80 15 C 90 25, 85 45, 70 45 C 60 45, 52 38, 50 30"
                      fill="none"
                      stroke="url(#goldGrad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.3"
                      transform="scale(1.1) translate(-4.5, -2.7)"
                    />
                    {/* Center glow */}
                    <circle cx="50" cy="30" r="4" fill="#3ddc84" opacity="0.8">
                      <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </motion.div>
                
                <div>
                  <h1 className="font-bold text-lg bg-gradient-to-r from-[#1a1a2e] to-gray-700 bg-clip-text text-transparent">
                    Tenchi<span className="text-[#00b8ff]">One</span>
                  </h1>
                  <p className="text-xs text-gray-500 -mt-0.5">SmartOrder Engine</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <Zap className="w-4 h-4" />
                Back to S&OP
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-700">SAP Connected</span>
                </div>
                
                <motion.div 
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white text-sm font-medium">TC</span>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex pt-16">
          {/* Sidebar - Glassmorphism */}
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-16 bottom-0 w-64 bg-white/70 backdrop-blur-xl border-r border-white/50 z-30 overflow-y-auto"
              >
                <nav className="p-4 space-y-6">
                  {/* Main Navigation */}
                  <div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Main Menu
                    </p>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link key={item.href} href={item.href}>
                            <motion.div
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                active 
                                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-orange-500/20' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <item.icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                              <span className="font-medium text-sm">{item.label}</span>
                              {active && (
                                <motion.div layoutId="activeIndicator" className="ml-auto">
                                  <ChevronRight className="w-4 h-4" />
                                </motion.div>
                              )}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Tools
                    </p>
                    <div className="space-y-1">
                      {toolItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link key={item.href} href={item.href}>
                            <motion.div
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                active 
                                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <item.icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                              <span className="font-medium text-sm">{item.label}</span>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Stats Card */}
                  <motion.div 
                    className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-gray-800 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-[#e89a2d]" />
                      <span className="text-xs font-medium text-gray-300">Today&apos;s Performance</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Orders</span>
                        <span className="text-sm font-bold">128</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Success Rate</span>
                        <span className="text-sm font-bold text-green-400">97.5%</span>
                      </div>
                    </div>
                  </motion.div>
                </nav>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-8"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
