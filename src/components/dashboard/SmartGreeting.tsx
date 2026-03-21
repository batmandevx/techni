'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, Coffee, Sparkles } from 'lucide-react';

interface SmartGreetingProps {
  userName: string;
}

export function SmartGreeting({ userName }: SmartGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState(`Welcome, ${userName}!`);
  const [subGreeting, setSubGreeting] = useState('Loading your dashboard...');
  const [icon, setIcon] = useState<React.ReactNode>(<Sun className="w-6 h-6 text-yellow-400" />);
  const [gradient, setGradient] = useState('from-yellow-500/20 via-orange-500/10 to-transparent');

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting(`Good morning, ${userName}! ☕`);
      setSubGreeting('Start your day with powerful supply chain insights');
      setIcon(<Coffee className="w-6 h-6 text-amber-400" />);
      setGradient('from-amber-500/20 via-orange-500/10 to-transparent');
    } else if (hour >= 12 && hour < 17) {
      setGreeting(`Good afternoon, ${userName}! ☀️`);
      setSubGreeting('Your supply chain is running smoothly');
      setIcon(<Sun className="w-6 h-6 text-yellow-400" />);
      setGradient('from-yellow-500/20 via-orange-500/10 to-transparent');
    } else if (hour >= 17 && hour < 21) {
      setGreeting(`Good evening, ${userName}! 🌅`);
      setSubGreeting('Review today\'s performance and plan for tomorrow');
      setIcon(<Cloud className="w-6 h-6 text-indigo-400" />);
      setGradient('from-indigo-500/20 via-purple-500/10 to-transparent');
    } else {
      setGreeting(`Good night, ${userName}! 🌙`);
      setSubGreeting('Your dashboard is ready whenever you need it');
      setIcon(<Moon className="w-6 h-6 text-blue-400" />);
      setGradient('from-blue-500/20 via-indigo-500/10 to-transparent');
    }
  }, [userName]);

  // Prevent hydration mismatch by rendering placeholder until mounted
  if (!mounted) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8"
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            animate={{
              y: [0, -30, 0],
              x: [0, ((i * 7) % 20) - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + ((i * 3) % 2),
              repeat: Infinity,
              delay: ((i * 5) % 2),
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${50 + ((i * 11) % 30)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700"
            >
              {icon}
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                System Online
              </span>
            </motion.div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {greeting}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            {subGreeting}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6 mt-6"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-400">AI Insights Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Real-time Data</span>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="hidden lg:grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">$12,845</p>
            <p className="text-xs text-emerald-400 mt-1">+18.2% vs yesterday</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">Active Orders</p>
            <p className="text-2xl font-bold text-white mt-1">156</p>
            <p className="text-xs text-indigo-400 mt-1">23 processing</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">Inventory Health</p>
            <p className="text-2xl font-bold text-white mt-1">94.5%</p>
            <p className="text-xs text-amber-400 mt-1">5 items low stock</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider">Forecast Accuracy</p>
            <p className="text-2xl font-bold text-white mt-1">96.2%</p>
            <p className="text-xs text-emerald-400 mt-1">+2.1% this week</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
