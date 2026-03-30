'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, TrendingUp, Package, DollarSign,
  AlertCircle, CheckCircle2, ArrowRight, Download,
  Settings, Sparkles, BarChart3, Target, Zap,
  RefreshCw, ChevronRight
} from 'lucide-react';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import {
  calculateReplenishment,
  calculateStockCoverageMonths,
  calculateAvgMonthlySales,
  calculateClosingStock,
} from '@/lib/forecasting';
import toast from 'react-hot-toast';

// ─── Dark Tooltip ──────────────────────────────────────────────────────────────
const DarkTooltip = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl p-3 text-xs shadow-2xl bg-slate-900/95 border border-white/10 backdrop-blur-xl">
    {children}
  </div>
);

// ─── Calculate order prompts ───────────────────────────────────────────────────
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

    const orderPromptQty = calculateReplenishment(latest.forecast, latest.safetyStock, closingStock);
    const orderPromptValue = orderPromptQty * mat.priceUSD;

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
  }).filter(item => item.orderPromptQty > 0)
    .sort((a, b) => b.orderPromptValue - a.orderPromptValue);
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color, delay = 0 }: any) {
  const colorMap: Record<string, string> = {
    blue: 'from-indigo-500 to-violet-600',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colorMap[color] || colorMap.blue}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderOptimizerPage() {
  const [safetyStockMultiplier, setSafetyStockMultiplier] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  const orderPrompts = useMemo(() => calculateOrderPrompts(), []);

  const totals = useMemo(() => {
    const totalQty = orderPrompts.reduce((sum, item) => sum + item.orderPromptQty, 0);
    const totalValue = orderPrompts.reduce((sum, item) => sum + item.orderPromptValue, 0);
    const highPriority = orderPrompts.filter(item => item.priority === 'high').length;
    const mediumPriority = orderPrompts.filter(item => item.priority === 'medium').length;

    return { totalQty, totalValue, highPriority, mediumPriority };
  }, [orderPrompts]);

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
    toast.success('Order prompts exported to CSV');
  };

  return (
    <div className="min-h-screen p-5 lg:p-7"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Reorder Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Order Optimizer</h1>
            <p className="text-sm text-slate-500 mt-0.5">AI-powered order prompt generation with safety stock</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 transition-all hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export
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
            className="mb-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Optimization Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Safety Stock Multiplier</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={safetyStockMultiplier}
                    onChange={(e) => setSafetyStockMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0.5x</span>
                    <span className="font-medium text-indigo-400">{safetyStockMultiplier}x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Order Prompt" value={totals.totalQty.toLocaleString()} subtitle="Units to order" icon={Package} color="blue" delay={0} />
        <KPICard title="Total Value" value={`$${(totals.totalValue / 1000).toFixed(1)}k`} subtitle="Order value" icon={DollarSign} color="emerald" delay={0.05} />
        <KPICard title="High Priority" value={totals.highPriority} subtitle="Coverage < 1 month" icon={AlertCircle} color="rose" delay={0.1} />
        <KPICard title="Medium Priority" value={totals.mediumPriority} subtitle="Coverage 1-2 months" icon={Target} color="amber" delay={0.15} />
      </div>

      {/* Summary by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-violet-400" />
          Order Prompt by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(byCategory).map(([category, data]) => (
            <div key={category} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm text-slate-400">{category}</p>
              <p className="text-xl font-bold text-white mt-1">{data.qty.toLocaleString()} units</p>
              <p className="text-sm text-emerald-400 mt-0.5">${data.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{data.items} SKUs</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Prompt Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Order Prompt Details
          </h2>
          <span className="text-xs text-slate-500">
            Formula: Order Prompt = max(0, (Forecast + Safety Stock) - Current Stock)
          </span>
        </div>

        {/* Total Row */}
        <div className="border-b border-indigo-500/20 px-4 py-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <div className="grid grid-cols-12 gap-4 text-sm">
            <div className="col-span-3 font-semibold text-indigo-400">TOTAL ({orderPrompts.length} SKUs)</div>
            <div className="col-span-2 text-right font-bold text-white">{totals.totalQty.toLocaleString()} units</div>
            <div className="col-span-3"></div>
            <div className="col-span-2 text-right font-bold text-emerald-400">${totals.totalValue.toLocaleString()}</div>
            <div className="col-span-2"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Coverage</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order (Units)</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order (Value)</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              </tr>
            </thead>
            <tbody>
              {orderPrompts.map((item, idx) => (
                <tr
                  key={item.sku}
                  className="border-t border-white/5 hover:bg-white/[0.025] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.sku}</td>
                  <td className="px-4 py-3 text-white font-medium text-xs">{item.name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{item.category}</td>
                  <td className="px-4 py-3 text-right text-white text-xs">{item.currentStock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-medium ${
                      item.coverageMonths < 1 ? 'text-rose-400' :
                      item.coverageMonths < 2 ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      {item.coverageMonths.toFixed(1)} mo
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-400 text-xs">
                    {item.orderPromptQty.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-400 text-xs">
                    ${item.orderPromptValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                      item.priority === 'high' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20' :
                      item.priority === 'medium' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                      'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {item.priority === 'high' ? <AlertCircle className="w-2.5 h-2.5" /> :
                       item.priority === 'medium' ? <Target className="w-2.5 h-2.5" /> :
                       <CheckCircle2 className="w-2.5 h-2.5" />}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-xl p-4"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <h3 className="font-semibold text-emerald-400 flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4" />
          Order Prompt Calculation Formula
        </h3>
        <div className="mt-3 space-y-2 text-xs text-slate-400">
          <p><span className="text-emerald-300 font-medium">Step 1:</span> Closing Stock = Opening Stock + In Transit - Actual Sales</p>
          <p><span className="text-emerald-300 font-medium">Step 2:</span> Stock Coverage = Closing Stock / Average Monthly Sales</p>
          <p><span className="text-emerald-300 font-medium">Step 3:</span> Order Prompt = max(0, (Forecast + Safety Stock) - Closing Stock)</p>
          <p><span className="text-emerald-300 font-medium">Step 4:</span> If Order Prompt &le; 0, no replenishment needed</p>
        </div>
      </motion.div>
    </div>
  );
}
