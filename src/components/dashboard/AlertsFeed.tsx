'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react';
import { useData } from '@/lib/DataContext';

const iconMap = {
  danger: <AlertTriangle className="h-4 w-4 text-red-400" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-400" />,
  info: <Info className="h-4 w-4 text-cyan-400" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
};

const borderMap = {
  danger: 'border-l-red-500/50',
  warning: 'border-l-amber-500/50',
  info: 'border-l-cyan-500/50',
  success: 'border-l-emerald-500/50',
};

export default function AlertsFeed() {
  const { alerts } = useData();
  const ALERTS = alerts || [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="section-title">Live Alerts</h3>
          <p className="mt-1 text-sm text-slate-500">Real-time operational updates</p>
        </div>
        <span className="badge-danger">
          <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          {ALERTS.filter((a: any) => a.type === 'danger').length} Critical
        </span>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        <AnimatePresence>
          {ALERTS.map((alert: any, i: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-start gap-3 rounded-xl border-l-2 ${borderMap[alert.type as keyof typeof borderMap]} bg-white/[0.02] p-3 transition-all hover:bg-white/[0.05]`}
            >
              <div className="mt-0.5">{iconMap[alert.type as keyof typeof iconMap]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{alert.title}</p>
                <p className="mt-0.5 text-xs text-slate-400 truncate">{alert.message}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 text-xs text-slate-600">
                <Clock className="h-3 w-3" />
                {alert.time}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
