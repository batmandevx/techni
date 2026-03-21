'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download, Filter } from 'lucide-react';

const data = [
  { month: 'Jan', forecast: 4000, actual: 4200, accuracy: 95 },
  { month: 'Feb', forecast: 3800, actual: 3900, accuracy: 97 },
  { month: 'Mar', forecast: 4500, actual: 4300, accuracy: 95.5 },
  { month: 'Apr', forecast: 4200, actual: 4600, accuracy: 91 },
  { month: 'May', forecast: 4800, actual: 4700, accuracy: 98 },
  { month: 'Jun', forecast: 5000, actual: 4900, accuracy: 98 },
  { month: 'Jul', forecast: 5200, actual: 5400, accuracy: 96 },
  { month: 'Aug', forecast: 5500, actual: 5300, accuracy: 96 },
  { month: 'Sep', forecast: 5800, actual: 5900, accuracy: 98 },
  { month: 'Oct', forecast: 6000, actual: 6100, accuracy: 98 },
  { month: 'Nov', forecast: 6200, actual: 6000, accuracy: 97 },
  { month: 'Dec', forecast: 6500, actual: 6800, accuracy: 95 },
];

const chartTypes = [
  { id: 'forecast', label: 'Forecast vs Actual', icon: TrendingUp },
  { id: 'accuracy', label: 'Accuracy Trend', icon: TrendingDown },
  { id: 'combined', label: 'Combined View', icon: Calendar },
];

export function PerformanceChart() {
  const [chartType, setChartType] = useState('forecast');
  const [timeRange, setTimeRange] = useState('12m');

  const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;
  const trend = data[data.length - 1].accuracy - data[0].accuracy;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Performance Metrics
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Forecast accuracy and demand trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <button className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setChartType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                chartType === type.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Avg Accuracy</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{avgAccuracy.toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <p className="text-sm text-blue-600 dark:text-blue-400">Total Forecast</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {(data.reduce((sum, d) => sum + d.forecast, 0) / 1000).toFixed(1)}k
          </p>
        </div>
        <div className={`p-4 rounded-xl ${trend >= 0 ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
          <p className={`text-sm ${trend >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            Trend
          </p>
          <p className={`text-2xl font-bold ${trend >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-rose-700 dark:text-rose-300'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'forecast' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="forecast" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorForecast)" 
                name="Forecast"
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActual)" 
                name="Actual"
              />
            </AreaChart>
          ) : chartType === 'accuracy' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis domain={[85, 100]} stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
                name="Accuracy %"
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="forecast" fill="#6366f1" radius={[4, 4, 0, 0]} name="Forecast" />
              <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
