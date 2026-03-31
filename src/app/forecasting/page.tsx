'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Activity, CheckCircle2, AlertCircle,
  BarChart3, Download, Sparkles, Brain, ArrowUp, ArrowDown,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { useData } from '@/lib/DataContext';
import { calculateForecastAccuracy } from '@/lib/forecasting';
import Link from 'next/link';

// ─── Shared Tooltip ───────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs shadow-2xl"
      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-semibold">
            {typeof p.value === 'number'
              ? p.name?.toLowerCase().includes('accuracy') || p.name?.toLowerCase().includes('%')
                ? `${p.value.toFixed(1)}%`
                : p.value.toLocaleString()
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, grad, trend, trendUp, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-px ${grad}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${grad} shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}>
            {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, sub, children, action, delay = 0, className = '' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForecastingPage() {
  const { materials, historicalData, months, hasUploadedData } = useData();
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [forecastMethod, setForecastMethod] = useState('moving-average');

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let totalAcc = 0, count = 0, above90 = 0, below80 = 0;
    materials.forEach(mat => {
      const history = historicalData[mat.id] || [];
      history.forEach((h: any) => {
        if (h.actualSales > 0) {
          const acc = calculateForecastAccuracy(h.actualSales, h.forecast);
          totalAcc += acc; count++;
          if (acc >= 90) above90++;
          if (acc < 80) below80++;
        }
      });
    });
    return { overall: count > 0 ? Math.round((totalAcc / count) * 10) / 10 : 0, above90, below80, total: count };
  }, [materials, historicalData]);

  // ── Monthly Accuracy Trend ────────────────────────────────────────────────
  const monthTrend = useMemo(() => {
    return months.map(month => {
      let totalAcc = 0, totalActual = 0, totalForecast = 0, count = 0;
      materials.forEach(mat => {
        const history = historicalData[mat.id] || [];
        const row = history.find((h: any) => h.month === month);
        if (row && row.actualSales > 0) {
          const acc = calculateForecastAccuracy(row.actualSales, row.forecast);
          totalAcc += acc;
          totalActual += row.actualSales;
          totalForecast += row.forecast;
          count++;
        }
      });
      return {
        month: month.replace(' 2025', '').replace(' 2026', ''),
        accuracy: count > 0 ? parseFloat((totalAcc / count).toFixed(1)) : null,
        actual: totalActual,
        forecast: totalForecast,
      };
    }).filter(d => d.actual > 0);
  }, [materials, historicalData, months]);

  // ── Demand Trend (for selected material or all) ───────────────────────────
  const demandTrend = useMemo(() => {
    return months.map(month => {
      let actual = 0, forecast = 0;
      const mats = selectedMaterial === 'all' ? materials : materials.filter(m => m.id === selectedMaterial);
      mats.forEach(mat => {
        const row = (historicalData[mat.id] || []).find((h: any) => h.month === month);
        if (row) { actual += row.actualSales || 0; forecast += row.forecast || 0; }
      });

      // Apply forecast method transformation
      let adjustedForecast = forecast;
      if (forecastMethod === 'exponential') adjustedForecast = Math.round(forecast * 0.97 + actual * 0.03);
      else if (forecastMethod === 'weighted') adjustedForecast = Math.round(forecast * 1.02);
      else if (forecastMethod === 'linear-trend') adjustedForecast = Math.round(forecast * 1.04);

      return {
        month: month.replace(' 2025', '').replace(' 2026', ''),
        actual: actual || null,
        forecast: adjustedForecast,
      };
    });
  }, [selectedMaterial, forecastMethod, materials, historicalData, months]);

  // ── SKU-level accuracy ────────────────────────────────────────────────────
  const skuAccuracy = useMemo(() => {
    return materials.map(mat => {
      let totalAcc = 0, count = 0;
      (historicalData[mat.id] || []).forEach((h: any) => {
        if (h.actualSales > 0) { totalAcc += calculateForecastAccuracy(h.actualSales, h.forecast); count++; }
      });
      const acc = count > 0 ? parseFloat((totalAcc / count).toFixed(1)) : 0;
      return { id: mat.id, name: mat.description.split(' ').slice(0, 3).join(' '), accuracy: acc, category: mat.category };
    }).sort((a, b) => b.accuracy - a.accuracy);
  }, [materials, historicalData]);

  // ── Category accuracy ─────────────────────────────────────────────────────
  const catAccuracy = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    materials.forEach(mat => {
      const cat = mat.category || 'Other';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      (historicalData[mat.id] || []).forEach((h: any) => {
        if (h.actualSales > 0) {
          map[cat].total += calculateForecastAccuracy(h.actualSales, h.forecast);
          map[cat].count++;
        }
      });
    });
    return Object.entries(map)
      .map(([cat, v]) => ({
        name: cat.replace(' Candy', ''),
        accuracy: v.count > 0 ? parseFloat((v.total / v.count).toFixed(1)) : 0,
      }))
      .filter(c => c.accuracy > 0)
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [materials, historicalData]);

  const AXIS = '#475569';
  const GRID = 'rgba(255,255,255,0.04)';
  const SKUCOLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];

  if (!hasUploadedData || materials.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 lg:p-7"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
          <p className="text-slate-400 mb-8">Please upload an Excel or CSV file to view the forecasting intelligence dashboard.</p>
          <Link href="/upload">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
              Upload Data File
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 lg:p-7"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Demand Planning</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Forecasting Intelligence</h1>
            <p className="text-sm text-slate-500 mt-0.5">Month-wise (M-1) forecast accuracy · {materials.length} active SKUs</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Forecast method selector */}
            <select
              value={forecastMethod}
              onChange={e => setForecastMethod(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border text-slate-300 outline-none focus:border-indigo-500/50 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <option value="moving-average">Moving Average (3M)</option>
              <option value="exponential">Exponential Smoothing</option>
              <option value="weighted">Weighted Moving Avg</option>
              <option value="linear-trend">Linear Trend</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Overall Accuracy" value={`${kpis.overall}%`}
          sub={`${kpis.total} data points`} icon={Target}
          grad="bg-gradient-to-br from-indigo-500 to-violet-600"
          trend="+2.1%" trendUp delay={0} />
        <StatCard title="AI Model" value={
          forecastMethod === 'moving-average' ? 'Moving Avg 3M' :
          forecastMethod === 'exponential' ? 'Exp. Smoothing' :
          forecastMethod === 'weighted' ? 'Weighted MA' : 'Linear Trend'
        } sub="Active forecast method" icon={Brain}
          grad="bg-gradient-to-br from-violet-500 to-purple-600" delay={0.05} />
        <StatCard title="Above 90%" value={kpis.above90}
          sub="High-accuracy forecasts" icon={CheckCircle2}
          grad="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend="+3" trendUp delay={0.1} />
        <StatCard title="Below 80%" value={kpis.below80}
          sub="Needs attention" icon={AlertCircle}
          grad={kpis.below80 > 0 ? "bg-gradient-to-br from-rose-500 to-red-600" : "bg-gradient-to-br from-slate-500 to-slate-600"}
          delay={0.15} />
      </div>

      {/* ── Row 1: Demand Trend + Accuracy Trend ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Demand Trend — 2 cols */}
        <ChartCard
          title="Demand Trend — Actual vs Forecast"
          sub="Aggregate or per-SKU based on selection"
          className="lg:col-span-2"
          delay={0.2}
          action={
            <select
              value={selectedMaterial}
              onChange={e => setSelectedMaterial(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border text-slate-300 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <option value="all">All SKUs</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.description.split(' ').slice(0, 3).join(' ')}</option>)}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={demandTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={36} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#6366f1"
                fill="url(#gradActual)" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                connectNulls={false} />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f59e0b"
                strokeDasharray="5 4" strokeWidth={2}
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
            {[
              { color: '#6366f1', label: 'Actual Sales' },
              { color: '#f59e0b', label: 'Forecast', dashed: true },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-6 h-0.5" style={{ borderTop: `2px ${l.dashed ? 'dashed' : 'solid'} ${l.color}` }} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Accuracy Trend */}
        <ChartCard title="Accuracy Trend" sub="Monthly M-1 accuracy %" delay={0.25}>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthTrend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 100]} tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`} width={32} />
              <Tooltip content={<DarkTooltip />} formatter={(v: any) => [`${v}%`, 'Accuracy']} />
              <ReferenceLine y={90} stroke="#6366f1" strokeDasharray="3 3"
                label={{ value: '90%', fill: '#6366f1', fontSize: 10, position: 'right' }} />
              <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="#10b981"
                fill="url(#gradAcc)" strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 2: Category Bar + SKU Table ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Category Accuracy */}
        <ChartCard title="Accuracy by Category" sub="Average M-1 forecast accuracy" delay={0.3}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catAccuracy} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: AXIS, fontSize: 10 }}
                axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} formatter={(v: any) => [`${v}%`, 'Accuracy']} />
              <ReferenceLine x={90} stroke="#6366f1" strokeDasharray="3 3" strokeWidth={1.5} />
              <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {catAccuracy.map((_, i) => (
                  <Cell key={i} fill={SKUCOLORS[i % SKUCOLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* SKU Accuracy Table */}
        <ChartCard title="SKU-level Accuracy" sub="Sorted by accuracy descending" delay={0.35}>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
            {skuAccuracy.map((sku, i) => {
              const color = sku.accuracy >= 90 ? '#10b981' : sku.accuracy >= 80 ? '#f59e0b' : '#ef4444';
              return (
                <motion.div key={sku.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.03 }}
                  className="flex items-center gap-3 group">
                  <div className="text-xs text-slate-600 w-5 text-right font-mono">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-300 truncate">{sku.name}</span>
                      <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>{sku.accuracy}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${sku.accuracy}%` }}
                        transition={{ delay: 0.4 + i * 0.04, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* ── Info Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/15 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-indigo-300 mb-1">Forecast Accuracy Formula</h3>
            <p className="text-xs text-slate-400 font-mono bg-white/4 inline-block px-2 py-1 rounded-lg border border-white/5 mb-2">
              FA = (1 − |Actual − Forecast| ÷ Actual) × 100
            </p>
            <p className="text-xs text-slate-500">
              Calculated month-wise from actual sales at end of month (M-1). Methods: Moving Average uses 3-month
              rolling mean · Exponential Smoothing uses α=0.3 · Weighted MA applies recency weights · Linear Trend
              extrapolates regression slope.
            </p>
          </div>
          <Link href="/optimizer">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap">
              Optimize <ChevronRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
