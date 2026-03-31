'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Show, UserButton } from '@/components/clerk/ClerkComponents';

interface HeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
  pageSubtitle: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'success', message: 'Batch #1234 processed successfully', time: '2m ago' },
  { id: '2', type: 'warning', message: '3 orders pending validation', time: '15m ago' },
  { id: '3', type: 'info', message: 'New Excel template available', time: '1h ago' },
];

export function Header({ onMenuClick, pageTitle, pageSubtitle }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-5 bg-[#080d1a]/85 backdrop-blur-xl border-b border-white/6">
      {/* Left: Mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{pageTitle}</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-500">{pageSubtitle}</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400">Live</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search orders, SKUs, customers..."
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/6 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 bg-white/5 border border-white/8 rounded px-1.5 py-0.5 hidden lg:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2" ref={notifRef}>
        {/* Mobile Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080d1a]" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl bg-[#111827] border border-white/8"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/6 text-center">
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <Link
              href="/auth"
              className="hidden sm:block px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=sign-up"
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500/80 hover:bg-indigo-500 rounded-xl transition-all"
            >
              Sign Up
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-7 h-7 rounded-full ring-2 ring-white/10',
                  userButtonTrigger: 'flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all',
                },
              }}
            />
          </Show>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#080d1a]/95 backdrop-blur-xl z-50 flex items-center px-4 md:hidden"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/6 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/40"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
