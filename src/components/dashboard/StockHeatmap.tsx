'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/lib/DataContext';
import { calculateClosingStock } from '@/lib/forecasting';

export default function StockHeatmap() {
  const { materials: MATERIALS, historicalData: HISTORICAL_DATA } = useData();
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  const getHeatColor = (coverage: number): string => {
    if (coverage <= 3) return 'bg-red-500/60';
    if (coverage <= 7) return 'bg-amber-500/50';
    if (coverage <= 14) return 'bg-emerald-500/40';
    if (coverage <= 21) return 'bg-emerald-500/25';
    return 'bg-cyan-500/20';
  };

  const getTextColor = (coverage: number): string => {
    if (coverage <= 3) return 'text-red-300';
    if (coverage <= 7) return 'text-amber-300';
    return 'text-emerald-300';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="mb-6">
        <h3 className="section-title">Stock Coverage Heatmap</h3>
        <p className="mt-1 text-sm text-slate-500">Days of inventory available by product & month</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium text-slate-500">Product</th>
              {months.map(m => (
                <th key={m} className="pb-3 text-center text-xs font-medium text-slate-500">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATERIALS.map((mat, mi) => (
              <motion.tr
                key={mat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + mi * 0.1 }}
              >
                <td className="py-1.5 pr-4 text-xs font-medium text-slate-300">
                  {mat.description.split(' ').slice(0, 2).join(' ')}
                </td>
                {HISTORICAL_DATA[mat.id]?.map((data: any, di: number) => {
                  const closing = calculateClosingStock(data.openingStock, data.stockInTransit, data.actualSales || data.forecastDemand);
                  const dailySales = (data.actualSales || data.forecastDemand) / 30;
                  const coverage = dailySales > 0 ? Math.round(closing / dailySales) : 0;
                  return (
                    <td key={di} className="p-1">
                      <div className={`flex items-center justify-center rounded-lg py-2 ${getHeatColor(coverage)} transition-all hover:scale-105`}>
                        <span className={`text-xs font-bold ${getTextColor(coverage)}`}>
                          {coverage}d
                        </span>
                      </div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-500/60" />
          <span>Critical (&lt;3d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-500/50" />
          <span>Warning (&lt;7d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500/40" />
          <span>Healthy (7-14d)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-cyan-500/20" />
          <span>Excess (&gt;21d)</span>
        </div>
      </div>
    </motion.div>
  );
}
