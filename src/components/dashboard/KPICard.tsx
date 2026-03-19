'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  trend: number;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
  status?: 'good' | 'warning' | 'critical';
}

export default function KPICard({ 
  title, 
  value, 
  suffix = '', 
  trend, 
  icon, 
  gradient, 
  delay = 0,
  status = 'good'
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Number(current.toFixed(1)));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const isPositiveTrend = trend > 0;

  const statusConfig = {
    good: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/5',
      icon: AlertCircle,
      iconColor: 'text-red-400',
    },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={`kpi-card group relative overflow-hidden border ${currentStatus.border} ${currentStatus.bg}`}
    >
      {/* Status Indicator */}
      <div className="absolute right-3 top-3">
        <StatusIcon className={`h-5 w-5 ${currentStatus.iconColor}`} />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-white">
              {displayValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-lg text-slate-400">{suffix}</span>
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} opacity-80 transition-opacity group-hover:opacity-100 shadow-lg`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          isPositiveTrend ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {isPositiveTrend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
        <span className="text-xs text-slate-500">vs last month</span>
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-700/30">
        <motion.div 
          className={`h-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / (status === 'good' ? 100 : status === 'warning' ? 80 : 60)) * 100, 100)}%` }}
          transition={{ duration: 1, delay: delay / 1000 + 0.5 }}
        />
      </div>
    </motion.div>
  );
}
