'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Download, 
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useData } from '@/lib/DataContext';
import { MATERIALS, MONTHS, HISTORICAL_DATA } from '@/lib/mock-data';
import { calculateForecastAccuracy } from '@/lib/calculations';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-lg">
        <p className="mb-2 font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500 dark:text-slate-400">{p.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastingPage() {
  const { historicalData, materials } = useData();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [forecastMethod, setForecastMethod] = useState<string>('moving-average');
  const [showAccuracyDetails, setShowAccuracyDetails] = useState(false);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // Forecast Accuracy Sheet
    const rows = MONTHS.flatMap((month, index) => {
      return materials.map(mat => {
        const matData = (historicalData[mat.id] || HISTORICAL_DATA[mat.id] || [])[index];
        if (!matData) return null;
        const actual = matData.actualSales || 0;
        const forecast = matData.forecast || 0;
        const acc = actual > 0 ? Math.max(0, Math.min(100, (1 - Math.abs(actual - forecast) / actual) * 100)) : 100;
        return {
          Month: month,
          'SKU ID': mat.id,
          'Description': mat.description,
          'Actual Sales': actual,
          'Forecast': forecast,
          'Variance': forecast - actual,
          'Forecast Accuracy (%)': acc.toFixed(1),
        };
      }).filter(Boolean);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Forecast_Accuracy');

    // Summary Sheet
    const summaryRows = materials.map(mat => {
      const matData = historicalData[mat.id] || HISTORICAL_DATA[mat.id] || [];
      const completed = matData.filter((d: any) => d.actualSales > 0);
      const lastMonth = completed[completed.length - 1];
      const acc = lastMonth && lastMonth.actualSales > 0
        ? Math.max(0, Math.min(100, (1 - Math.abs(lastMonth.actualSales - lastMonth.forecast) / lastMonth.actualSales) * 100))
        : 100;
      return {
        'SKU ID': mat.id,
        'Description': mat.description,
        'M-1 Actual': lastMonth?.actualSales || 0,
        'M-1 Forecast': lastMonth?.forecast || 0,
        'M-1 Accuracy (%)': acc.toFixed(1),
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'M-1_Summary');

    XLSX.writeFile(wb, 'Tenchi_Forecast_Report.xlsx');
  };

  // Calculate forecast accuracy data for M-1 (previous month)
  const forecastAccuracyData = useMemo(() => {
    const data = MONTHS.map((month, index) => {
      let totalActual = 0;
      let totalForecast = 0;
      
      Object.values(historicalData).forEach(matData => {
        const monthData = matData[index];
        if (monthData) {
          totalActual += monthData.actualSales || 0;
          totalForecast += monthData.forecast || 0;
        }
      });
      
      // Calculate month-wise forecast accuracy (M-1 based)
      const accuracy = totalActual > 0 
        ? calculateForecastAccuracy(totalActual, totalForecast)
        : 100;
      
      return {
        month,
        actual: totalActual,
        forecast: totalForecast,
        accuracy: Math.round(accuracy * 10) / 10,
      };
    });
    
    return data;
  }, [historicalData]);

  // Calculate material-level forecast accuracy
  const materialAccuracyData = useMemo(() => {
    return materials.map(mat => {
      const matData = historicalData[mat.id];
      if (!matData || matData.length < 2) {
        return {
          id: mat.id,
          name: mat.description,
          accuracy: 100,
          avgActual: 0,
          avgForecast: 0,
        };
      }
      
      // Use last completed month (M-1) for accuracy calculation
      const completedMonths = matData.filter(d => d.actualSales > 0);
      if (completedMonths.length === 0) {
        return {
          id: mat.id,
          name: mat.description,
          accuracy: 100,
          avgActual: 0,
          avgForecast: 0,
        };
      }
      
      const lastMonth = completedMonths[completedMonths.length - 1];
      const accuracy = calculateForecastAccuracy(lastMonth.actualSales, lastMonth.forecast);
      
      return {
        id: mat.id,
        name: mat.description,
        accuracy: Math.round(accuracy * 10) / 10,
        avgActual: Math.round(completedMonths.reduce((sum, d) => sum + d.actualSales, 0) / completedMonths.length),
        avgForecast: Math.round(matData.reduce((sum, d) => sum + d.forecast, 0) / matData.length),
      };
    });
  }, [materials, historicalData]);

  // Calculate overall accuracy (based on M-1 actuals)
  const overallAccuracy = useMemo(() => {
    const validAccuracies = materialAccuracyData.filter(m => m.avgActual > 0);
    if (validAccuracies.length === 0) return 100;
    return Math.round(validAccuracies.reduce((sum, m) => sum + m.accuracy, 0) / validAccuracies.length * 10) / 10;
  }, [materialAccuracyData]);

  // Demand vs Actual chart data
  const demandTrendData = useMemo(() => {
    return MONTHS.map((month, index) => {
      let totalActual = 0;
      let totalForecast = 0;
      
      Object.values(historicalData).forEach(matData => {
        const monthData = matData[index];
        if (monthData) {
          totalActual += monthData.actualSales || 0;
          totalForecast += monthData.forecast || 0;
        }
      });
      
      return {
        month: month.split(' ')[0], // Short month name
        actual: totalActual,
        forecast: totalForecast,
        variance: totalForecast - totalActual,
      };
    });
  }, [historicalData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <TrendingUp className="h-6 w-6 text-indigo-500" />
                Demand Forecasting
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                AI-powered demand predictions and forecast accuracy analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Overall Accuracy (M-1)</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{overallAccuracy}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Forecast Period</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">6 Months</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">AI Model</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Moving Average</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20">
                <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Active SKUs</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{materials.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Demand vs Forecast Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Demand vs Forecast Trend
              </h3>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-white"
              >
                <option value="all">All Materials</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.description}</option>
                ))}
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Sales" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    name="Forecast" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Forecast Accuracy by Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Forecast Accuracy by Month (M-1)
              </h3>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Based on actuals
              </span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="accuracy" 
                    name="Accuracy %" 
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Material-level Accuracy Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Forecast Accuracy by Material
              </h3>
              <button
                onClick={() => setShowAccuracyDetails(!showAccuracyDetails)}
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {showAccuracyDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showAccuracyDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              M-1 forecast accuracy based on last month actuals
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">SKU ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Avg Actual</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Avg Forecast</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Accuracy</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {materialAccuracyData.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{item.id}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                      {item.avgActual.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                      {item.avgForecast.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        item.accuracy >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                        item.accuracy >= 80 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.accuracy >= 90 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          On Target
                        </span>
                      ) : item.accuracy >= 80 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <AlertCircle size={12} />
                          Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-xs font-medium text-red-700 dark:text-red-400">
                          <AlertCircle size={12} />
                          Action
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 p-4"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-indigo-900 dark:text-indigo-400">AI Forecasting Model</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Forecast accuracy is calculated using M-1 (previous month) actual sales data. 
                The formula used is: 1 - (|Actual - Forecast| / Actual) × 100. 
                Higher accuracy indicates better forecast performance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
