'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Search, ChevronRight, Clock, CalendarDays } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload Data',
  '/forecasting': 'Forecasting Engine',
  '/ai-assistant': 'AI Assistant',
  '/reports': 'Reports & Export',
  '/orders': 'Order Management',
  '/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';
  
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    if (!currentDateTime) return 'Welcome back,';
    const hour = currentDateTime.getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-surface/60 px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 hidden sm:block">Tenchi S&OP</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 hidden sm:block" />
          <span className="font-display text-sm font-semibold text-white">{title}</span>
        </div>
        
        {/* Date and Time */}
        {currentDateTime && (
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-400 ml-4 pl-4 border-l border-white/10">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-brand-400" />
              <span>{currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>{currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="glass-input w-64 py-2 pl-9 pr-4 text-sm"
          />
        </div>

        {/* Notifications */}
        <button className="glass-button relative p-2.5">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-1">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs text-slate-400">{getGreeting()}</p>
            <p className="text-sm font-bold text-white tracking-wide">Admin User</p>
          </div>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-[2px]">
              <div className="h-full w-full rounded-full bg-surface-dark flex items-center justify-center border border-white/10 shadow-inner">
                 <span className="font-display text-sm font-bold text-white">AU</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-surface-dark" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
