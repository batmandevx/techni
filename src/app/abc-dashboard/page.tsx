'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

const stats = [
  { label: 'A-Class Items', value: '20%', count: 156, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'B-Class Items', value: '30%', count: 234, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'C-Class Items', value: '50%', count: 390, color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

export default function ABCDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ABC Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">
          Inventory classification based on value and consumption
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.count} items</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <PieChart className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Value Distribution</h3>
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Top Moving Items</h3>
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-medium text-indigo-400">
                  {i}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Product SKU-{1000 + i}</p>
                  <p className="text-xs text-slate-500">1,234 units moved</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-400">$12,450</p>
                  <p className="text-xs text-slate-500">+12.5%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
