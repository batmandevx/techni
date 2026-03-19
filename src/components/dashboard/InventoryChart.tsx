'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useData } from '@/lib/DataContext';
import { calculateClosingStock } from '@/lib/forecasting';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#3b82f6', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface-50/95 p-4 shadow-xl backdrop-blur-xl">
        <p className="mb-2 font-display text-sm font-semibold text-white">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color || COLORS[i] }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-semibold text-white">{p.value.toLocaleString()} cartons</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function InventoryChart() {
  const { materials: MATERIALS, historicalData: HISTORICAL_DATA } = useData();
  // Current inventory levels (latest month's closing stock)
  const data = MATERIALS.map((mat, i) => {
    const latest = HISTORICAL_DATA[mat.id]?.[5]; // March 2026
    const closing = latest ? calculateClosingStock(latest.openingStock, latest.stockInTransit, latest.actualSales || latest.forecast) : 0;
    return {
      name: mat.description.split(' ').slice(0, 2).join(' '),
      stock: closing,
      safety: latest?.safetyStock || 0,
      color: COLORS[i],
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="section-title">Inventory Levels</h3>
        <p className="mt-1 text-sm text-slate-500">Current stock vs safety stock by product</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="stock" name="Closing Stock" radius={[6, 6, 0, 0]} barSize={36}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Bar>
            <Bar dataKey="safety" name="Safety Stock" radius={[6, 6, 0, 0]} barSize={36} fill="#ef4444" fillOpacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
