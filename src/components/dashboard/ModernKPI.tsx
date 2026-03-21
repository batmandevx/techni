'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface ModernKPIProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'blue' | 'purple';
  sparklineData?: number[];
  onClick?: () => void;
}

const colorMap = {
  indigo: {
    bg: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    icon: 'bg-indigo-500/20 text-indigo-400',
    gradient: 'from-indigo-500 to-purple-600',
  },
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/20 text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/20 text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
  },
  rose: {
    bg: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/20',
    icon: 'bg-rose-500/20 text-rose-400',
    gradient: 'from-rose-500 to-pink-600',
  },
  cyan: {
    bg: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    icon: 'bg-cyan-500/20 text-cyan-400',
    gradient: 'from-cyan-500 to-blue-600',
  },
  violet: {
    bg: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/20',
    icon: 'bg-violet-500/20 text-violet-400',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/20 text-blue-400',
    gradient: 'from-blue-500 to-indigo-600',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    icon: 'bg-purple-500/20 text-purple-400',
    gradient: 'from-purple-500 to-violet-600',
  },
};

export function ModernKPI({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  color,
  sparklineData,
  onClick,
}: ModernKPIProps) {
  const colors = colorMap[color];
  const isPositive = change && change >= 0;
  const [progressWidth, setProgressWidth] = useState(60);

  useEffect(() => {
    // Generate random width only on client to avoid hydration mismatch
    setProgressWidth(Math.floor(Math.random() * 40) + 60);
  }, []);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl p-6
        bg-gradient-to-br ${colors.bg}
        border ${colors.border}
        backdrop-blur-xl
        cursor-pointer
        group
      `}
    >
      {/* Background Glow */}
      <div className={`
        absolute -top-20 -right-20 w-40 h-40 rounded-full
        bg-gradient-to-br ${colors.gradient}
        opacity-10 blur-3xl
        group-hover:opacity-20 transition-opacity duration-500
      `} />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${colors.icon}`}>
          {icon}
        </div>
        <button className="p-2 rounded-xl hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Value */}
      <div className="relative">
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400 mb-3">{title}</p>

        {/* Change Indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && (
        <div className="mt-4 h-12">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
