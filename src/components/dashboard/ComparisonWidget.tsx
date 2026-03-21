'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Package,
  DollarSign,
  BarChart3,
  ChevronDown
} from 'lucide-react';

interface ComparisonMetric {
  id: string;
  label: string;
  current: number;
  previous: number;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
}

const metrics: ComparisonMetric[] = [
  { id: 'sku-count', label: 'Total SKUs', current: 234, previous: 218, unit: '', format: 'number' },
  { id: 'stock-value', label: 'Stock Value', current: 68400, previous: 63200, unit: '$', format: 'currency' },
  { id: 'accuracy', label: 'Forecast Accuracy', current: 94.2, previous: 90.7, unit: '%', format: 'percentage' },
  { id: 'orders', label: 'Orders Processed', current: 156, previous: 142, unit: '', format: 'number' },
  { id: 'low-stock', label: 'Low Stock Items', current: 8, previous: 12, unit: '', format: 'number' },
  { id: 'turnover', label: 'Inventory Turnover', current: 4.2, previous: 3.8, unit: 'x', format: 'number' },
];

const timeRanges = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: '1y', label: 'Last Year' },
];

function formatValue(value: number, format: string, unit: string): string {
  switch (format) {
    case 'currency':
      return `$${(value / 1000).toFixed(1)}k`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString() + unit;
  }
}

export function ComparisonWidget() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['stock-value', 'accuracy', 'orders']);
  const [showDropdown, setShowDropdown] = useState(false);

  const calculateChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const displayedMetrics = metrics.filter(m => selectedMetrics.includes(m.id));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Period Comparison</h3>
            <p className="text-sm text-gray-500">Compare current vs previous period</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {timeRanges.find(t => t.id === timeRange)?.label}
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-xl z-10"
              >
                {timeRanges.map(range => (
                  <button
                    key={range.id}
                    onClick={() => {
                      setTimeRange(range.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50 dark:hover:bg-slate-700 ${
                      timeRange === range.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map(metric => {
          const isSelected = selectedMetrics.includes(metric.id);
          return (
            <button
              key={metric.id}
              onClick={() => {
                if (isSelected) {
                  if (selectedMetrics.length > 1) {
                    setSelectedMetrics(prev => prev.filter(id => id !== metric.id));
                  }
                } else {
                  setSelectedMetrics(prev => [...prev, metric.id]);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedMetrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const ChangeIcon = change.isPositive ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-slate-400">{metric.label}</span>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  change.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  <ChangeIcon className="w-3 h-3" />
                  {change.value.toFixed(1)}%
                </div>
              </div>
              
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatValue(metric.current, metric.format, metric.unit)}
                  </p>
                  <p className="text-xs text-gray-400">Current</p>
                </div>
                <ArrowRightLeft className="w-4 h-4 text-gray-300 mb-4" />
                <div>
                  <p className="text-lg font-medium text-gray-500 dark:text-slate-400">
                    {formatValue(metric.previous, metric.format, metric.unit)}
                  </p>
                  <p className="text-xs text-gray-400">Previous</p>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="mt-3 flex items-end gap-1 h-8">
                <div 
                  className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-t"
                  style={{ height: `${(metric.previous / Math.max(metric.current, metric.previous)) * 100}%` }}
                />
                <div 
                  className={`flex-1 rounded-t ${change.isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ height: `${(metric.current / Math.max(metric.current, metric.previous)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Prev</span>
                <span>Curr</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
