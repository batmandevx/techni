'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, TrendingUp, Package, DollarSign, 
  AlertCircle, CheckCircle2, ArrowRight, Download,
  Settings, Sparkles, BarChart3, Target, Zap
} from 'lucide-react';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import { 
  calculateReplenishment, 
  calculateStockCoverageMonths,
  calculateAvgMonthlySales,
  calculateClosingStock,
  type ForecastResult 
} from '@/lib/forecasting';

// Calculate order prompts for all materials
const calculateOrderPrompts = () => {
  return MATERIALS.map(mat => {
    const history = HISTORICAL_DATA[mat.id] || [];
    const latest = history[history.length - 1] || {
      openingStock: 1000,
      stockInTransit: 200,
      actualSales: 500,
      forecast: 550,
      safetyStock: 300
    };
    
    const closingStock = calculateClosingStock(latest.openingStock, latest.stockInTransit, latest.actualSales);
    const avgMonthlySales = calculateAvgMonthlySales(history.map((h: any) => h.actualSales).filter((s: number) => s > 0));
    const coverageMonths = calculateStockCoverageMonths(closingStock, avgMonthlySales);
    
    // Calculate order prompt (replenishment)
    const orderPromptQty = calculateReplenishment(latest.forecast, latest.safetyStock, closingStock);
    const orderPromptValue = orderPromptQty * mat.priceUSD;
    
    // Determine priority
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (coverageMonths < 1) priority = 'high';
    else if (coverageMonths < 2) priority = 'medium';
    
    return {
      sku: mat.id,
      name: mat.description,
      category: mat.category,
      currentStock: closingStock,
      safetyStock: latest.safetyStock,
      avgMonthlySales,
      coverageMonths,
      orderPromptQty,
      orderPromptValue,
      unitPrice: mat.priceUSD,
      priority,
      inTransit: latest.stockInTransit
    };
  }).filter(item => item.orderPromptQty > 0) // Only show items needing replenishment
    .sort((a, b) => b.orderPromptValue - a.orderPromptValue);
};

const KPICard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function OrderOptimizerPage() {
  const [safetyStockMultiplier, setSafetyStockMultiplier] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  
  const orderPrompts = useMemo(() => calculateOrderPrompts(), []);
  
  // Calculate totals
  const totals = useMemo(() => {
    const totalQty = orderPrompts.reduce((sum, item) => sum + item.orderPromptQty, 0);
    const totalValue = orderPrompts.reduce((sum, item) => sum + item.orderPromptValue, 0);
    const highPriority = orderPrompts.filter(item => item.priority === 'high').length;
    const mediumPriority = orderPrompts.filter(item => item.priority === 'medium').length;
    
    return { totalQty, totalValue, highPriority, mediumPriority };
  }, [orderPrompts]);

  // Group by category
  const byCategory = useMemo(() => {
    const grouped: Record<string, { qty: number; value: number; items: number }> = {};
    orderPrompts.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = { qty: 0, value: 0, items: 0 };
      }
      grouped[item.category].qty += item.orderPromptQty;
      grouped[item.category].value += item.orderPromptValue;
      grouped[item.category].items++;
    });
    return grouped;
  }, [orderPrompts]);

  const handleExport = () => {
    // Export to Excel/CSV
    const csvContent = [
      ['SKU', 'Description', 'Category', 'Current Stock', 'Safety Stock', 'Avg Monthly Sales', 'Coverage (Months)', 'Order Prompt (Units)', 'Unit Price', 'Order Prompt (Value)'].join(','),
      ...orderPrompts.map(item => [
        item.sku,
        `"${item.name}"`,
        item.category,
        item.currentStock,
        item.safetyStock,
        item.avgMonthlySales,
        item.coverageMonths.toFixed(2),
        item.orderPromptQty,
        item.unitPrice.toFixed(2),
        item.orderPromptValue.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_prompts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Order Optimizer
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              AI-powered order prompt generation with safety stock optimization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              Optimization Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Safety Stock Multiplier</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={safetyStockMultiplier}
                  onChange={(e) => setSafetyStockMultiplier(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5x</span>
                  <span className="font-medium text-indigo-600">{safetyStockMultiplier}x</span>
                  <span>2.0x</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard 
          title="Total Order Prompt" 
          value={totals.totalQty.toLocaleString()} 
          subtitle="Units to order"
          icon={Package} 
          color="bg-blue-500" 
        />
        <KPICard 
          title="Total Value" 
          value={`$${(totals.totalValue / 1000).toFixed(1)}k`} 
          subtitle="Order value"
          icon={DollarSign} 
          color="bg-emerald-500" 
        />
        <KPICard 
          title="High Priority" 
          value={totals.highPriority} 
          subtitle="Coverage < 1 month"
          icon={AlertCircle} 
          color="bg-rose-500" 
        />
        <KPICard 
          title="Medium Priority" 
          value={totals.mediumPriority} 
          subtitle="Coverage 1-2 months"
          icon={Target} 
          color="bg-amber-500" 
        />
      </div>

      {/* Summary by Category */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-6 shadow-sm mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-500" />
          Order Prompt by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(byCategory).map(([category, data]) => (
            <div key={category} className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
              <p className="text-sm text-gray-500">{category}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{data.qty.toLocaleString()} units</p>
              <p className="text-sm text-emerald-600">${data.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{data.items} SKUs</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Prompt Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Order Prompt Details
          </h2>
          <span className="text-sm text-gray-500">
            Formula: Order Prompt = (Forecast + Safety Stock) - Current Stock
          </span>
        </div>
        
        {/* Total Row */}
        <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/30 px-4 py-3">
          <div className="grid grid-cols-12 gap-4 text-sm">
            <div className="col-span-3 font-semibold text-indigo-700 dark:text-indigo-400">TOTAL</div>
            <div className="col-span-2 text-right font-bold text-gray-900 dark:text-white">{totals.totalQty.toLocaleString()} units</div>
            <div className="col-span-3"></div>
            <div className="col-span-2 text-right font-bold text-emerald-600">${totals.totalValue.toLocaleString()}</div>
            <div className="col-span-2"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Current Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Safety Stock</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Coverage</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Order Prompt (Units)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Order Prompt (Value)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Priority</th>
              </tr>
            </thead>
            <tbody>
              {orderPrompts.map((item, idx) => (
                <tr key={item.sku} className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{item.sku}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.category}</td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{item.currentStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">{item.safetyStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${
                      item.coverageMonths < 1 ? 'text-rose-600' : 
                      item.coverageMonths < 2 ? 'text-amber-600' : 
                      'text-emerald-600'
                    }`}>
                      {item.coverageMonths.toFixed(1)} mo
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.orderPromptQty.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    ${item.orderPromptValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                      item.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    }`}>
                      {item.priority === 'high' ? <AlertCircle className="w-3 h-3" /> :
                       item.priority === 'medium' ? <Target className="w-3 h-3" /> :
                       <CheckCircle2 className="w-3 h-3" />}
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Formula Explanation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4"
      >
        <h3 className="font-semibold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Order Prompt Calculation Formula
        </h3>
        <div className="mt-3 space-y-2 text-sm text-emerald-800 dark:text-emerald-300">
          <p><strong>Step 1:</strong> Closing Stock = Opening Stock + In Transit - Actual Sales</p>
          <p><strong>Step 2:</strong> Stock Coverage = Closing Stock / Average Monthly Sales</p>
          <p><strong>Step 3:</strong> Order Prompt = (Forecast Demand + Safety Stock) - Closing Stock</p>
          <p><strong>Step 4:</strong> If Order Prompt ≤ 0, no replenishment needed</p>
          <p className="mt-2 text-emerald-700 dark:text-emerald-400">
            <strong>Note:</strong> Safety stock is considered in the calculation to ensure buffer inventory is maintained.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Required for AnimatePresence
import { AnimatePresence } from 'framer-motion';
