'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useData } from '@/lib/DataContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface-50/95 p-4 shadow-xl backdrop-blur-xl">
        <p className="mb-2 font-display text-sm font-semibold text-white">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-semibold text-white">{p.value.toLocaleString()} cartons</span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="mt-2 border-t border-white/5 pt-2 text-xs text-slate-500">
            Deviation: {((1 - Math.abs(payload[0].value - payload[1].value) / Math.max(payload[0].value, 1)) * 100).toFixed(1)}% accuracy
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function DemandChart() {
  const { demandTrend: DEMAND_VS_ACTUAL } = useData();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="section-title">Demand vs Actual Sales</h3>
          <p className="mt-1 text-sm text-slate-500">6-month trend comparison (all SKUs)</p>
        </div>
        <div className="flex gap-2">
          <button className="badge-info cursor-pointer">6M</button>
          <button className="badge cursor-pointer bg-white/5 text-slate-400">1Y</button>
        </div>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEMAND_VS_ACTUAL} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value: string) => <span className="text-sm text-slate-400">{value}</span>}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#forecastGrad)"
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#1e1b4b' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Actual Sales"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#actualGrad)"
              dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#1e1b4b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
