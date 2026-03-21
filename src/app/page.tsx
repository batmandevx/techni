'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, ComposedChart, Scatter, ScatterChart
} from 'recharts';
import {
  Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle2,
  AlertCircle, ArrowUpRight, ArrowDownRight, Activity, BarChart3, Layers,
  ShoppingCart, Users, Zap, Target, Clock, Calendar, Bell, Download,
  RefreshCw, Settings, ChevronRight, Eye, Boxes, Warehouse, Truck,
  Star, Flame, Shield, X, Search, Filter, MoreHorizontal, Globe,
  PieChart as PieChartIcon, BrainCircuit, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';
import { performABCAnalysis, calculateClosingStock, processInventoryRecord } from '@/lib/forecasting';
import { MATERIALS, HISTORICAL_DATA, MONTHS, ALERTS, CUSTOMERS, SAMPLE_ORDERS } from '@/lib/mock-data';

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: {
  value: number; suffix?: string; prefix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 50;
    const inc = value / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [value]);
  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1', height = 36 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${height - ((v - min) / range) * height}`).join(' ');
  const areaD = `M0,${height} L${pts} L100,${height} Z`;
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={areaD} fill={`url(#sp-${color.replace('#', '')})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
      <motion.polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      <circle cx={pts.split(' ').at(-1)?.split(',')[0]} cy={pts.split(' ').at(-1)?.split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

// ─── Radial Progress ─────────────────────────────────────────────────────────
function RadialProgress({ value, max = 100, color, size = 80, label }: { value: number; max?: number; color: string; size?: number; label: string }) {
  const pct = (value / max) * 100;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-slate-700" />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-900 dark:text-white">{value.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-slate-400 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Mini Stock Bar ───────────────────────────────────────────────────────────
function StockBar({ current, safety, max, color }: { current: number; safety: number; max: number; color: string }) {
  const currentPct = Math.min((current / max) * 100, 100);
  const safetyPct = Math.min((safety / max) * 100, 100);
  return (
    <div className="relative h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-visible">
      <motion.div className="absolute left-0 top-0 h-full rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${currentPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
      <div className="absolute top-1/2 -translate-y-1/2 h-3.5 w-0.5 bg-rose-500 rounded-full" style={{ left: `${safetyPct}%` }} />
    </div>
  );
}

// ─── Alert Badge ──────────────────────────────────────────────────────────────
function AlertBadge({ type }: { type: 'danger' | 'warning' | 'info' | 'success' }) {
  const config = {
    danger: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
    warning: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    info: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    success: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  }[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action, actionLabel, icon: Icon, gradient }: {
  title: string; subtitle?: string; action?: () => void; actionLabel?: string;
  icon?: any; gradient: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action && actionLabel && (
        <button onClick={action} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
          {actionLabel} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { orders: rawOrders, customers, kpis } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders'>('overview');
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Computed Data ─────────────────────────────────────────────────────────

  // ABC Analysis
  const abcData = useMemo(() => {
    const materialsWithHistory = MATERIALS.map(mat => {
      const history = HISTORICAL_DATA[mat.id] || [];
      const historicalSales = history.map(h => h.actualSales).filter(s => s > 0);
      const historicalForecasts = history.map(h => h.forecast);
      const latest = history[history.length - 1];
      const currentStock = latest ? calculateClosingStock(latest.openingStock, latest.stockInTransit, latest.actualSales) : 0;
      return {
        id: mat.id, description: mat.description, priceUSD: mat.priceUSD,
        category: mat.category || 'Uncategorized', historicalSales, historicalForecasts,
        currentStock, batchDate: mat.batchDate, expiryDate: mat.expiryDate,
        forecastDemand: latest?.forecast || 0,
      };
    });
    return performABCAnalysis(materialsWithHistory);
  }, []);

  // Monthly sales + forecast trend (all SKUs)
  const salesTrendData = useMemo(() => MONTHS.map((month, i) => {
    let actual = 0, forecast = 0, value = 0;
    Object.entries(HISTORICAL_DATA).forEach(([matId, data]) => {
      const mat = MATERIALS.find(m => m.id === matId);
      const d = data[i];
      actual += d.actualSales;
      forecast += d.forecast;
      value += d.actualSales * (mat?.priceUSD || 0);
    });
    return { month: month.split(' ')[0], actual, forecast, value: Math.round(value) };
  }), []);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, { revenue: number; units: number; sku: number }> = {};
    MATERIALS.forEach(mat => {
      const cat = mat.category || 'Other';
      if (!map[cat]) map[cat] = { revenue: 0, units: 0, sku: 0 };
      const history = HISTORICAL_DATA[mat.id] || [];
      history.filter(h => h.actualSales > 0).forEach(h => {
        map[cat].revenue += h.actualSales * mat.priceUSD;
        map[cat].units += h.actualSales;
      });
      map[cat].sku++;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), units: v.units, sku: v.sku }))
      .sort((a, b) => b.revenue - a.revenue);
  }, []);

  // Inventory snapshot per SKU
  const inventorySnapshot = useMemo(() => MATERIALS.map(mat => {
    const history = HISTORICAL_DATA[mat.id] || [];
    const latest = history[history.length - 1];
    const currentStock = latest ? calculateClosingStock(latest.openingStock, latest.stockInTransit, latest.actualSales) : 0;
    const salesValues = history.filter(h => h.actualSales > 0).map(h => h.actualSales);
    const avgMonthly = salesValues.length ? salesValues.reduce((a, b) => a + b, 0) / salesValues.length : 0;
    const coverageMonths = avgMonthly > 0 ? currentStock / avgMonthly : 0;
    const safetyStock = latest?.safetyStock || 0;
    const maxStock = Math.max(...history.map(h => h.openingStock + h.stockInTransit), 1);
    const orderPromptResult = latest ? processInventoryRecord({
      materialId: mat.id, month: latest.month,
      openingStock: latest.openingStock, stockInTransit: latest.stockInTransit,
      actualSales: latest.actualSales, forecastDemand: latest.forecast,
      safetyStock: latest.safetyStock, priceUSD: mat.priceUSD,
    }) : null;
    return {
      ...mat, currentStock, avgMonthly: Math.round(avgMonthly), coverageMonths,
      safetyStock, maxStock, stockValue: currentStock * mat.priceUSD,
      orderPrompt: orderPromptResult?.replenishmentQty || 0,
      orderPromptValue: (orderPromptResult?.replenishmentQty || 0) * mat.priceUSD,
      transitStock: latest?.stockInTransit || 0,
    };
  }), []);

  // KPI aggregates
  const kpiAgg = useMemo(() => {
    const totalStockValue = inventorySnapshot.reduce((s, i) => s + i.stockValue, 0);
    const totalOrderPromptValue = inventorySnapshot.reduce((s, i) => s + i.orderPromptValue, 0);
    const lowCoverage = inventorySnapshot.filter(i => i.coverageMonths < 1).length;
    const healthyItems = inventorySnapshot.filter(i => i.coverageMonths >= 2).length;

    let totalAcc = 0, accCount = 0;
    Object.values(HISTORICAL_DATA).forEach(data => {
      const completed = data.filter(d => d.actualSales > 0);
      if (completed.length) {
        const last = completed[completed.length - 1];
        if (last.actualSales > 0) {
          totalAcc += Math.max(0, Math.min(100, (1 - Math.abs(last.actualSales - last.forecast) / last.actualSales) * 100));
          accCount++;
        }
      }
    });
    const forecastAccuracy = accCount > 0 ? totalAcc / accCount : 94.2;
    const totalUnits = inventorySnapshot.reduce((s, i) => s + i.currentStock, 0);
    const totalForecast = HISTORICAL_DATA[MATERIALS[0].id]?.at(-1)?.forecast || 0;

    return {
      totalStockValue, totalOrderPromptValue, lowCoverage, healthyItems,
      forecastAccuracy, totalUnits, totalSKUs: MATERIALS.length,
      activeCustomers: customers.length || 7,
      totalOrders: rawOrders.length || SAMPLE_ORDERS.length,
    };
  }, [inventorySnapshot, customers.length, rawOrders.length]);

  // ABC distribution for pie
  const abcDist = useMemo(() => {
    const a = abcData.filter(d => d.classification === 'A');
    const b = abcData.filter(d => d.classification === 'B');
    const c = abcData.filter(d => d.classification === 'C');
    return [
      { name: 'A Class', count: a.length, value: a.reduce((s, d) => s + (d.totalSalesValue || 0), 0), color: '#10b981' },
      { name: 'B Class', count: b.length, value: b.reduce((s, d) => s + (d.totalSalesValue || 0), 0), color: '#f59e0b' },
      { name: 'C Class', count: c.length, value: c.reduce((s, d) => s + (d.totalSalesValue || 0), 0), color: '#f43f5e' },
    ];
  }, [abcData]);

  // Accuracy trend
  const accuracyTrend = useMemo(() => MONTHS.map((month, i) => {
    let totalAct = 0, totalFore = 0;
    Object.values(HISTORICAL_DATA).forEach(data => {
      totalAct += data[i]?.actualSales || 0;
      totalFore += data[i]?.forecast || 0;
    });
    if (totalAct === 0) return null;
    const accuracy = Math.max(0, Math.min(100, (1 - Math.abs(totalAct - totalFore) / totalAct) * 100));
    return { month: month.split(' ')[0], accuracy: Math.round(accuracy * 10) / 10 };
  }).filter(Boolean) as { month: string; accuracy: number }[], []);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const orders = rawOrders.length > 0 ? rawOrders : SAMPLE_ORDERS;
    const counts: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = (o.status || 'CREATED').toUpperCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [rawOrders]);

  // Customer geography
  const geoData = useMemo(() => {
    const map: Record<string, number> = {};
    CUSTOMERS.forEach(c => {
      map[c.country] = (map[c.country] || 0) + 1;
    });
    return Object.entries(map).map(([country, count]) => ({ country, count }));
  }, []);

  // Radar data (performance by category)
  const radarData = useMemo(() => {
    return categoryData.slice(0, 6).map(cat => ({
      subject: cat.name.replace(' Candy', '').replace(' Box', ''),
      forecast: Math.round(Math.random() * 30 + 70),
      coverage: Math.round(Math.random() * 40 + 60),
      accuracy: Math.round(Math.random() * 20 + 75),
    }));
  }, []);

  // Sparkline histories per KPI
  const sparklines = useMemo(() => ({
    accuracy: [88, 90, 91, 89, 93, 94, 92, 95, kpiAgg.forecastAccuracy],
    stockValue: [42000, 45000, 48000, 44000, 50000, 52000, 49000, 55000, kpiAgg.totalStockValue / 100],
    orders: [8, 10, 9, 12, 11, 13, 10, 12, kpiAgg.totalOrders],
    risk: [15, 12, 14, 11, 9, 10, 8, 7, kpiAgg.lowCoverage],
  }), [kpiAgg]);

  const activeAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));

  const fmtValue = (v: number) => v >= 1000000
    ? `$${(v / 1000000).toFixed(1)}M`
    : `$${(v / 1000).toFixed(1)}k`;

  const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">

      {/* ── TOP HEADER ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm"
      >
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  Tenchi S&OP Platform
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Center: Tabs */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
              {(['overview', 'inventory', 'orders'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeAlerts.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <button className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeAlerts.length}
                  </span>
                </motion.div>
              )}
              <Link href="/reports">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 py-6 max-w-[1600px] mx-auto space-y-6">

        {/* ── ROW 1: HERO KPI CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'Forecast Accuracy', value: kpiAgg.forecastAccuracy, suffix: '%', decimals: 1,
              icon: Target, color: '#6366f1', bgGrad: 'from-indigo-500/10 to-purple-500/10',
              border: 'border-indigo-200/50 dark:border-indigo-500/20',
              badge: kpiAgg.forecastAccuracy >= 90 ? { text: '↑ On Target', c: 'text-emerald-600' } : { text: '⚠ Review', c: 'text-amber-600' },
              spark: sparklines.accuracy,
            },
            {
              label: 'Stock Value', value: kpiAgg.totalStockValue, fmt: fmtValue,
              icon: DollarSign, color: '#10b981', bgGrad: 'from-emerald-500/10 to-teal-500/10',
              border: 'border-emerald-200/50 dark:border-emerald-500/20',
              badge: { text: '8 SKUs', c: 'text-emerald-600' },
              spark: sparklines.stockValue,
            },
            {
              label: 'Order Prompt', value: kpiAgg.totalOrderPromptValue, fmt: fmtValue,
              icon: ShoppingCart, color: '#f59e0b', bgGrad: 'from-amber-500/10 to-orange-500/10',
              border: 'border-amber-200/50 dark:border-amber-500/20',
              badge: { text: 'Pending', c: 'text-amber-600' },
              spark: [20000, 25000, 22000, 28000, 30000, 27000, 32000, 29000, kpiAgg.totalOrderPromptValue / 10],
            },
            {
              label: 'Low Stock Items', value: kpiAgg.lowCoverage, suffix: '',
              icon: AlertTriangle, color: kpiAgg.lowCoverage > 0 ? '#f43f5e' : '#10b981',
              bgGrad: kpiAgg.lowCoverage > 0 ? 'from-rose-500/10 to-red-500/10' : 'from-emerald-500/10 to-teal-500/10',
              border: kpiAgg.lowCoverage > 0 ? 'border-rose-200/50 dark:border-rose-500/20' : 'border-emerald-200/50 dark:border-emerald-500/20',
              badge: { text: kpiAgg.lowCoverage > 0 ? 'Action Needed' : 'All Healthy', c: kpiAgg.lowCoverage > 0 ? 'text-rose-600' : 'text-emerald-600' },
              spark: sparklines.risk.map(v => Math.max(0, v)),
            },
            {
              label: 'Active Customers', value: kpiAgg.activeCustomers, suffix: '',
              icon: Users, color: '#8b5cf6', bgGrad: 'from-violet-500/10 to-purple-500/10',
              border: 'border-violet-200/50 dark:border-violet-500/20',
              badge: { text: '7 Countries', c: 'text-violet-600' },
              spark: [5, 5, 6, 6, 7, 7, 7, 7, kpiAgg.activeCustomers],
            },
            {
              label: 'Total Orders', value: kpiAgg.totalOrders, suffix: '',
              icon: Package, color: '#06b6d4', bgGrad: 'from-cyan-500/10 to-blue-500/10',
              border: 'border-cyan-200/50 dark:border-cyan-500/20',
              badge: { text: 'This Period', c: 'text-cyan-600' },
              spark: sparklines.orders,
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border ${kpi.border} p-4 shadow-sm hover:shadow-lg transition-all cursor-default`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgGrad} opacity-60`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <span className={`text-xs font-medium ${kpi.badge.c}`}>{kpi.badge.text}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {kpi.fmt
                    ? kpi.fmt(kpi.value)
                    : <AnimatedCounter value={kpi.value} suffix={kpi.suffix || ''} decimals={kpi.decimals || 0} />}
                </p>
                <div className="mt-2">
                  <Sparkline data={kpi.spark} color={kpi.color} height={28} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── ROW 2: SALES TREND + ABC DONUT ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Sales + Forecast Area Chart — 2/3 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Sales vs Forecast Trend" subtitle="6-month rolling · all SKUs"
              icon={TrendingUp} gradient="from-indigo-500 to-purple-600"
              action={() => {}} actionLabel="View Forecasting" />
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="units" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="value" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  <Area yAxisId="units" type="monotone" dataKey="actual" name="Actual Sales" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#gradActual)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Area yAxisId="units" type="monotone" dataKey="forecast" name="Forecast" stroke="#10b981" strokeWidth={2}
                    strokeDasharray="6 3" fill="url(#gradForecast)" dot={{ r: 3, fill: '#10b981' }} />
                  <Bar yAxisId="value" dataKey="value" name="Revenue ($)" fill="url(#gradValue)" stroke="#f59e0b"
                    strokeWidth={1} radius={[4, 4, 0, 0]} opacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ABC Distribution Donut — 1/3 width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm flex flex-col"
          >
            <SectionHeader title="ABC Classification" subtitle="by sales value"
              icon={PieChartIcon} gradient="from-emerald-500 to-teal-600"
              action={() => {}} actionLabel="ABC Dashboard" />
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {abcDist.map((d, i) => (
                        <radialGradient key={i} id={`abc-${i}`}>
                          <stop offset="0%" stopColor={d.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={d.color} stopOpacity={0.7} />
                        </radialGradient>
                      ))}
                    </defs>
                    <Pie data={abcDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                      paddingAngle={3} dataKey="count" animationBegin={300} animationDuration={1200}>
                      {abcDist.map((entry, i) => (
                        <Cell key={i} fill={`url(#abc-${i})`} stroke={entry.color} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${v} SKUs`, p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 w-full mt-1">
                {abcDist.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-700 dark:text-slate-300 font-medium">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{d.count} SKUs</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{fmtValue(d.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: INVENTORY HEALTH + CATEGORY MIX + ACCURACY ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Inventory Coverage per SKU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Inventory Coverage" subtitle="current stock vs safety stock"
              icon={Warehouse} gradient="from-amber-500 to-orange-600" />
            <div className="space-y-3 mt-2">
              {inventorySnapshot.map((item, i) => {
                const color = item.coverageMonths < 1 ? '#f43f5e' : item.coverageMonths < 2 ? '#f59e0b' : '#10b981';
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.04 }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-400 flex-shrink-0">{item.id}</span>
                        <span className="text-xs text-gray-700 dark:text-slate-300 truncate">{item.description.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0 ml-2" style={{ color }}>
                        {item.coverageMonths.toFixed(1)}mo
                      </span>
                    </div>
                    <StockBar current={item.currentStock} safety={item.safetyStock} max={item.maxStock} color={color} />
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-8 h-1 bg-gray-300 dark:bg-slate-600 rounded-full inline-block" />
                Current Stock
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-0.5 h-3 bg-rose-500 rounded-full inline-block" />
                Safety Stock
              </div>
            </div>
          </motion.div>

          {/* Category Revenue Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Revenue by Category" subtitle="cumulative actual sales"
              icon={BarChart3} gradient="from-violet-500 to-purple-600" />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                  <defs>
                    {categoryData.map((_, i) => (
                      <linearGradient key={i} id={`cat-${i}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={1} />
                        <stop offset="100%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    width={58} tickFormatter={v => v.replace(' Candy', '').replace(' Box', '')} />
                  <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" name="Revenue ($)" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={`url(#cat-${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Forecast Accuracy Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Forecast Accuracy" subtitle="M-1 rolling accuracy %"
              icon={Activity} gradient="from-cyan-500 to-blue-600" />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={90} stroke="#10b981" strokeDasharray="4 2" strokeWidth={1.5}
                    label={{ value: 'Target 90%', position: 'right', fontSize: 10, fill: '#10b981' }} />
                  <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`${v}%`, 'Accuracy']} />
                  <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="#06b6d4" strokeWidth={2.5}
                    fill="url(#gradAcc)" dot={{ r: 4, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Radial gauges */}
            <div className="flex items-center justify-around pt-3 border-t border-gray-100 dark:border-slate-700 mt-2">
              <RadialProgress value={kpiAgg.forecastAccuracy} color="#06b6d4" size={64} label="Forecast" />
              <RadialProgress value={96.5} color="#10b981" size={64} label="Fill Rate" />
              <RadialProgress value={Math.round((kpiAgg.healthyItems / kpiAgg.totalSKUs) * 100)} color="#6366f1" size={64} label="Healthy" />
            </div>
          </motion.div>
        </div>

        {/* ── ROW 4: INVENTORY DETAIL TABLE + ALERTS ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Detailed Inventory Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 shadow-lg">
                  <Boxes className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Inventory Snapshot</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Live stock levels & order prompts</p>
                </div>
              </div>
              <Link href="/abc-dashboard">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer">
                  ABC View <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 dark:bg-slate-900/50">
                  <tr>
                    {['SKU', 'Product', 'Stock', 'Transit', 'Safety', 'Coverage', 'Order Prompt', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventorySnapshot.map((item, i) => {
                    const statusColor = item.coverageMonths < 1
                      ? { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', label: 'Action for Provision' }
                      : item.coverageMonths < 2
                        ? { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', label: 'Action for Sales' }
                        : { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Healthy' };
                    const abc = abcData.find(a => a.materialId === item.id);
                    return (
                      <motion.tr key={item.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * i }}
                        className="border-t border-gray-100 dark:border-slate-700/50 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {abc && (
                              <span className={`w-5 h-5 rounded text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${abc.classification === 'A' ? 'bg-emerald-500' : abc.classification === 'B' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                {abc.classification}
                              </span>
                            )}
                            <span className="font-mono text-xs text-gray-500 dark:text-slate-400">{item.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[140px]">
                          <span className="truncate block text-xs">{item.description}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white text-xs">{item.currentStock.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-xs text-cyan-600 dark:text-cyan-400">{item.transitStock.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">{item.safetyStock.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-bold ${item.coverageMonths < 1 ? 'text-rose-600' : item.coverageMonths < 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.coverageMonths.toFixed(1)}mo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {item.orderPrompt > 0 ? (
                            <div>
                              <div className="font-semibold text-indigo-600 dark:text-indigo-400">{item.orderPrompt.toLocaleString()}</div>
                              <div className="text-gray-400">{fmtValue(item.orderPromptValue)}</div>
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
                            {statusColor.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Alerts Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 shadow-lg">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Live Alerts</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{activeAlerts.length} active notifications</p>
                </div>
              </div>
              {activeAlerts.length > 0 && (
                <button onClick={() => setDismissedAlerts(ALERTS.map(a => a.id))}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 font-medium">
                  Clear all
                </button>
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin">
              <AnimatePresence>
                {activeAlerts.map((alert) => (
                  <motion.div key={alert.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`relative rounded-xl p-3 border ${alert.type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
                      : alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                        : alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20'}`}
                  >
                    <button onClick={() => setDismissedAlerts(p => [...p, alert.id])}
                      className="absolute top-2 right-2 p-0.5 rounded-md opacity-40 hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <div className="flex items-start gap-2 pr-5">
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.type === 'danger' ? 'bg-rose-100 dark:bg-rose-500/20'
                        : alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-500/20'
                          : alert.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20'
                            : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                        {alert.type === 'danger' ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          : alert.type === 'warning' ? <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            : alert.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              : <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                          <AlertBadge type={alert.type} />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeAlerts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">All clear!</p>
                  <p className="text-xs text-gray-400">No active alerts at this time</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 5: ORDERS + CUSTOMERS + RADAR ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Orders Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Orders Pipeline" subtitle="by status · current period"
              icon={ShoppingCart} gradient="from-indigo-500 to-cyan-600"
              action={() => {}} actionLabel="View Orders" />
            {/* Status Bars */}
            <div className="space-y-3">
              {[
                { status: 'DELIVERED', color: '#10b981', icon: CheckCircle2 },
                { status: 'SHIPPED', color: '#06b6d4', icon: Truck },
                { status: 'CONFIRMED', color: '#6366f1', icon: CheckCircle2 },
                { status: 'CREATED', color: '#f59e0b', icon: Package },
                { status: 'PENDING', color: '#f43f5e', icon: AlertCircle },
              ].map(({ status, color, icon: Icon }) => {
                const found = ordersByStatus.find(o => o.status === status);
                const count = found?.count || 0;
                const total = Math.max(ordersByStatus.reduce((s, o) => s + o.count, 0), 1);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-gray-700 dark:text-slate-300 capitalize">{status.toLowerCase()}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${(count / total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Recent orders */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2">Recent Orders</p>
              <div className="space-y-2">
                {SAMPLE_ORDERS.slice(0, 4).map((o, i) => {
                  const cust = CUSTOMERS.find(c => c.id === o.customerId);
                  const mat = MATERIALS.find(m => m.id === o.materialId);
                  const statusCfg: Record<string, string> = {
                    Delivered: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
                    Shipped: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10',
                    Confirmed: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10',
                    Created: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
                  };
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                      className="flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <span className="font-mono text-gray-500">{o.orderId}</span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="text-gray-700 dark:text-slate-300">{cust?.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${statusCfg[o.status] || 'text-gray-600 bg-gray-100'}`}>
                        {o.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Customer Geography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Customer Geography" subtitle="active accounts by region"
              icon={Globe} gradient="from-rose-500 to-pink-600" />
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geoData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {geoData.map((_, i) => (
                      <linearGradient key={i} id={`geo-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={1} />
                        <stop offset="100%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={0.5} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} formatter={(v: any) => [v, 'Customers']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {geoData.map((_, i) => <Cell key={i} fill={`url(#geo-${i})`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-1 gap-2">
                {CUSTOMERS.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="font-medium text-gray-700 dark:text-slate-300">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{c.city}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">{c.paymentTerms}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Performance Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Performance Radar" subtitle="forecast · coverage · accuracy"
              icon={BrainCircuit} gradient="from-violet-500 to-indigo-600" />
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke="rgba(128,128,128,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Forecast" dataKey="forecast" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Coverage" dataKey="coverage" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* KPI summary pills */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Avg Coverage', value: `${(inventorySnapshot.reduce((s, i) => s + i.coverageMonths, 0) / inventorySnapshot.length).toFixed(1)}mo`, color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' },
                { label: 'Fill Rate', value: '96.5%', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
                { label: 'Turns', value: '7.8×', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' },
              ].map(pill => (
                <div key={pill.label} className={`rounded-xl p-2 text-center ${pill.color}`}>
                  <p className="text-xs font-bold">{pill.value}</p>
                  <p className="text-[10px] mt-0.5">{pill.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 6: QUICK NAVIGATION ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {[
            { href: '/abc-dashboard', label: 'ABC Dashboard', sub: 'SKU Classification', icon: Layers, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25' },
            { href: '/forecasting', label: 'Forecasting', sub: 'Demand Prediction', icon: TrendingUp, gradient: 'from-indigo-500 to-purple-600', glow: 'shadow-indigo-500/25' },
            { href: '/optimizer', label: 'Optimizer', sub: 'EOQ & Replenishment', icon: Target, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/25' },
            { href: '/orders', label: 'Orders', sub: 'Order Management', icon: ShoppingCart, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/25' },
            { href: '/upload', label: 'Upload Data', sub: 'Import Excel/CSV', icon: Boxes, gradient: 'from-violet-500 to-pink-600', glow: 'shadow-violet-500/25' },
            { href: '/reports', label: 'Reports', sub: 'Export & Share', icon: Activity, gradient: 'from-rose-500 to-red-600', glow: 'shadow-rose-500/25' },
          ].map((nav, i) => (
            <Link key={nav.href} href={nav.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 + i * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-gray-200/50 dark:border-slate-700/50 p-4 shadow-sm hover:shadow-lg ${nav.glow} transition-all cursor-pointer group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${nav.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${nav.gradient} flex items-center justify-center shadow-lg ${nav.glow} mb-3`}>
                  <nav.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{nav.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{nav.sub}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 absolute top-4 right-4 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* ── ROW 7: BOTTOM — SKU DEEP DIVE + STOCK HEATMAP ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Monthly Stock Breakdown per SKU — stacked bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Monthly Sales by SKU" subtitle="stacked units · 6-month view"
              icon={BarChart3} gradient="from-indigo-500 to-violet-600" />
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {MONTHS.map((_, monthIdx) => null)}
                  {/* Show actual vs forecast as grouped bars */}
                  <Bar dataKey="actual" name="Actual Sales" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="forecast" name="Forecast" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Order Prompt Value per SKU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            <SectionHeader title="Order Prompt by SKU" subtitle="units & value requiring replenishment"
              icon={Zap} gradient="from-amber-500 to-rose-600"
              action={() => {}} actionLabel="Optimizer" />
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventorySnapshot.filter(i => i.orderPrompt > 0)}
                  layout="vertical" margin={{ top: 0, right: 50, left: 65, bottom: 0 }}>
                  <defs>
                    <linearGradient id="opGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="id" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} formatter={(v: any) => [v.toLocaleString(), 'Units']} />
                  <Bar dataKey="orderPrompt" name="Order Prompt (units)" fill="url(#opGrad)" radius={[0, 6, 6, 0]} maxBarSize={20}
                    label={{ position: 'right', fontSize: 10, fill: '#94a3b8', formatter: (v: any) => v > 0 ? v.toLocaleString() : '' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Total summary */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {inventorySnapshot.reduce((s, i) => s + i.orderPrompt, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Units</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {fmtValue(inventorySnapshot.reduce((s, i) => s + i.orderPromptValue, 0))}
                </p>
                <p className="text-xs text-gray-500">Total Value</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {inventorySnapshot.filter(i => i.orderPrompt > 0).length}
                </p>
                <p className="text-xs text-gray-500">SKUs Needing Order</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4 border-t border-gray-200/50 dark:border-slate-800/50 text-xs text-gray-400 dark:text-slate-600"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tenchi S&OP Platform · Sales & Operations Planning</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Data as of {MONTHS[MONTHS.length - 1]}</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
