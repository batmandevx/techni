'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, LineChart, Line, ComposedChart,
  ReferenceLine, ReferenceArea, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Calculator, SlidersHorizontal, TrendingUp, Package, AlertTriangle, RefreshCw,
  Brain, Download, FileSpreadsheet, BarChart3, PieChart as PieChartIcon,
  Activity, Target, Zap, ChevronDown, ChevronUp, Info, Filter,
  Calendar, Layers, Gauge, Settings2, Sparkles, Eye, EyeOff,
  ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Save, Trash2,
  History, Lightbulb, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import {
  processInventoryRecord,
  whatIfScenario,
  movingAverageForecast,
  exponentialSmoothing,
  holtSmoothing,
  linearRegressionForecast,
  analyzeTrend,
  generateScenarios,
  calculateAggregateMetrics,
  generateForecast,
  calculateEOQ,
  calculateStatisticalSafetyStock,
  calculateReorderPoint,
  type ForecastMethod,
  type ForecastResult,
  type TrendAnalysis
} from '@/lib/forecasting';
import { useExcelData, useForecastSettings } from '@/lib/hooks/useLocalStorage';

// ============================================
// Types & Interfaces
// ============================================

interface MaterialForecast {
  materialId: string;
  materialName: string;
  data: ForecastResult[];
  trend: TrendAnalysis;
  nextMonthForecast: number;
  confidence: number;
}

interface ChartTab {
  id: string;
  label: string;
  icon: any;
}

// ============================================
// Constants & Config
// ============================================

const COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#a78bfa'],
  accent: ['#06b6d4', '#22d3ee', '#67e8f9'],
  success: ['#10b981', '#34d399', '#6ee7b7'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
  danger: ['#ef4444', '#f87171', '#fca5a5'],
  neutral: ['#64748b', '#94a3b8', '#cbd5e1'],
};

const FORECAST_METHODS: { id: ForecastMethod; label: string; description: string }[] = [
  { id: 'sma', label: 'Moving Average', description: 'Simple average of recent periods' },
  { id: 'wma', label: 'Weighted MA', description: 'Weighted average favoring recent data' },
  { id: 'ses', label: 'Exp. Smoothing', description: 'Exponential decay weighting' },
  { id: 'holt', label: "Holt's Method", description: 'Trend-adjusted smoothing' },
  { id: 'linear', label: 'Linear Regression', description: 'Linear trend projection' },
  { id: 'seasonal', label: 'Seasonal', description: 'Seasonal pattern recognition' },
];

const CHART_TABS: ChartTab[] = [
  { id: 'forecast', label: 'Forecast vs Actual', icon: Activity },
  { id: 'trend', label: 'Trend Analysis', icon: TrendingUp },
  { id: 'accuracy', label: 'Accuracy Metrics', icon: Target },
  { id: 'distribution', label: 'Distribution', icon: PieChartIcon },
];

// ============================================
// Utility Components
// ============================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-xl backdrop-blur-xl">
        <p className="mb-2 font-semibold text-white">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-semibold text-white">
              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend,
  onClick,
  isActive 
}: any) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`cursor-pointer rounded-2xl border p-5 transition-all ${
      isActive 
        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' 
        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400">{title}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div 
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}20`, color }}
      >
        <Icon size={20} />
      </div>
    </div>
    {trend !== undefined && (
      <div className="mt-3 flex items-center gap-1.5">
        {trend > 0 ? (
          <ArrowUpRight size={14} className="text-emerald-400" />
        ) : trend < 0 ? (
          <ArrowDownRight size={14} className="text-red-400" />
        ) : (
          <Minus size={14} className="text-slate-400" />
        )}
        <span className={`text-xs font-medium ${
          trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'
        }`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-slate-500">vs last period</span>
      </div>
    )}
  </motion.div>
);

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-4 flex items-end justify-between">
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ============================================
// Main Component
// ============================================

export default function ForecastingPage() {
  // Context & Hooks
  const { materials: MATERIALS, historicalData: HISTORICAL_DATA, hasUploadedData, orders } = useData();
  const { excelData } = useExcelData();
  const { settings, setSettings } = useForecastSettings();
  
  // State
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]?.id || 'M2001');
  const [forecastMethod, setForecastMethod] = useState<ForecastMethod>(settings.defaultMethod);
  const [demandAdjust, setDemandAdjust] = useState(0);
  const [safetyAdjust, setSafetyAdjust] = useState(0);
  const [showScenario, setShowScenario] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState('forecast');
  const [showSettings, setShowSettings] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [showInsights, setShowInsights] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Get material data
  const materialData = useMemo(() => {
    // If we have uploaded Excel data, aggregate it
    if (hasUploadedData && orders.length > 0) {
      const matOrders = orders.filter(o => o.materialId === selectedMaterial);
      const monthlyAgg: Record<string, number> = {};
      
      matOrders.forEach(o => {
        const month = new Date(o.orderDate).toLocaleString('en-US', { month: 'short', year: '2-digit' });
        monthlyAgg[month] = (monthlyAgg[month] || 0) + o.quantity;
      });
      
      // Merge with historical template
      const baseData = HISTORICAL_DATA[selectedMaterial] || [];
      return baseData.map(d => ({
        ...d,
        actualSales: monthlyAgg[d.month] || d.actualSales,
      }));
    }
    
    return HISTORICAL_DATA[selectedMaterial] || [];
  }, [HISTORICAL_DATA, selectedMaterial, hasUploadedData, orders]);

  // Process forecasts
  const forecastResults: ForecastResult[] = useMemo(() => {
    return materialData.map((d: any) => {
      const record = {
        materialId: selectedMaterial,
        month: d.month,
        openingStock: d.openingStock,
        stockInTransit: d.stockInTransit,
        actualSales: d.actualSales,
        forecastDemand: d.forecast,
        safetyStock: d.safetyStock,
      };
      return showScenario
        ? whatIfScenario(record, demandAdjust, safetyAdjust)
        : processInventoryRecord(record);
    });
  }, [materialData, selectedMaterial, demandAdjust, safetyAdjust, showScenario]);

  // Calculate metrics
  const historicalSales = materialData.filter((d: any) => d.actualSales > 0).map((d: any) => d.actualSales);
  const metrics = useMemo(() => calculateAggregateMetrics(forecastResults), [forecastResults]);
  
  // Moving averages
  const ma3 = useMemo(() => movingAverageForecast(historicalSales, 3), [historicalSales]);
  const ma6 = useMemo(() => movingAverageForecast(historicalSales, 6), [historicalSales]);
  
  // Advanced forecasts
  const nextMonthForecast = useMemo(() => {
    return generateForecast(historicalSales, { method: forecastMethod, periods: 3 });
  }, [historicalSales, forecastMethod]);
  
  // Trend analysis
  const trend = useMemo(() => analyzeTrend(historicalSales), [historicalSales]);
  
  // Scenarios
  const scenarios = useMemo(() => generateScenarios({
    materialId: selectedMaterial,
    month: 'Next Month',
    openingStock: forecastResults[forecastResults.length - 1]?.closingStock || 0,
    stockInTransit: 0,
    actualSales: 0,
    forecastDemand: nextMonthForecast,
    safetyStock: forecastResults[0]?.safetyStock || 500,
  }), [forecastResults, nextMonthForecast, selectedMaterial]);

  // SAP Advanced Calculations
  const currentMaterialObj = useMemo(() => MATERIALS.find((m: any) => m.id === selectedMaterial) || MATERIALS[0], [MATERIALS, selectedMaterial]);
  
  const sapEoQ = useMemo(() => {
    if (historicalSales.length === 0) return 0;
    const annualDemand = (historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length) * 12;
    return calculateEOQ(annualDemand, currentMaterialObj.orderingCost || 50, (currentMaterialObj.priceUSD || 1) * (currentMaterialObj.holdingCostPct || 0.2));
  }, [historicalSales, currentMaterialObj]);

  const sapSafetyStock = useMemo(() => {
    if (historicalSales.length === 0) return 500;
    const avg = historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length;
    const variance = historicalSales.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / historicalSales.length;
    const stdDev = Math.sqrt(variance);
    return calculateStatisticalSafetyStock(avg, stdDev, currentMaterialObj.leadTimeDays || 14, currentMaterialObj.serviceLevel || 0.95);
  }, [historicalSales, currentMaterialObj]);

  const sapRop = useMemo(() => {
    if (historicalSales.length === 0) return 0;
    const avgDailyDemand = (historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length) / 30;
    return calculateReorderPoint(avgDailyDemand, currentMaterialObj.leadTimeDays || 14, sapSafetyStock);
  }, [historicalSales, currentMaterialObj, sapSafetyStock]);


  // Chart data
  const chartData = useMemo(() => forecastResults.map(r => ({
    month: r.month.slice(0, 3),
    actual: r.actualSales || undefined,
    forecast: r.forecastDemand,
    closing: r.closingStock,
    replenishment: r.replenishmentQty,
    accuracy: r.forecastAccuracy,
    risk: r.stockoutRisk,
  })), [forecastResults]);

  // Accuracy distribution data
  const accuracyDistribution = useMemo(() => {
    const ranges = [
      { name: 'Excellent (>90%)', min: 90, max: 100, color: COLORS.success[0] },
      { name: 'Good (80-90%)', min: 80, max: 90, color: COLORS.accent[0] },
      { name: 'Fair (70-80%)', min: 70, max: 80, color: COLORS.warning[0] },
      { name: 'Poor (<70%)', min: 0, max: 70, color: COLORS.danger[0] },
    ];
    
    return ranges.map(range => ({
      ...range,
      value: forecastResults.filter(r => 
        r.actualSales > 0 && 
        r.forecastAccuracy >= range.min && 
        r.forecastAccuracy < range.max
      ).length,
    })).filter(r => r.value > 0);
  }, [forecastResults]);

  // Export to Excel
  const exportToExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const XLSX = await import('xlsx');
      
      const ws = XLSX.utils.json_to_sheet(forecastResults.map(r => ({
        Month: r.month,
        'Opening Stock': r.openingStock,
        'In Transit': r.stockInTransit,
        'Actual Sales': r.actualSales,
        'Forecast Demand': r.forecastDemand,
        'Closing Stock': r.closingStock,
        'Replenishment Qty': r.replenishmentQty,
        'Forecast Accuracy (%)': r.forecastAccuracy.toFixed(2),
        'Stockout Risk (%)': r.stockoutRisk,
        'Coverage (Days)': r.stockCoverageDays,
      })));
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Forecast');
      XLSX.writeFile(wb, `Forecast_${selectedMaterial}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  }, [forecastResults, selectedMaterial]);

  // Save scenario
  const saveScenario = useCallback(() => {
    const newScenario = {
      id: Date.now(),
      name: `Scenario ${savedScenarios.length + 1}`,
      materialId: selectedMaterial,
      demandAdjust,
      safetyAdjust,
      timestamp: new Date().toISOString(),
    };
    setSavedScenarios(prev => [...prev, newScenario]);
  }, [savedScenarios.length, selectedMaterial, demandAdjust, safetyAdjust]);

  // AI Insights
  const insights = useMemo(() => {
    const items = [];
    
    if (trend.direction === 'up') {
      items.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Upward Trend Detected',
        description: `Sales are trending upward with ${trend.strength}% confidence. Consider increasing safety stock.`,
      });
    } else if (trend.direction === 'down') {
      items.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Downward Trend Alert',
        description: 'Sales declining. Review inventory levels to prevent overstocking.',
      });
    }
    
    const highRisk = forecastResults.filter(r => r.stockoutRisk > 50);
    if (highRisk.length > 0) {
      items.push({
        type: 'danger',
        icon: AlertTriangle,
        title: `${highRisk.length} High Risk Period${highRisk.length > 1 ? 's' : ''}`,
        description: `Stockout risk exceeds 50% in ${highRisk.map(r => r.month).join(', ')}.`,
      });
    }
    
    const lowAccuracy = forecastResults.filter(r => r.actualSales > 0 && r.forecastAccuracy < 80);
    if (lowAccuracy.length > 0) {
      items.push({
        type: 'warning',
        icon: Target,
        title: 'Forecast Accuracy Low',
        description: 'Consider adjusting forecast parameters or reviewing demand patterns.',
      });
    }
    
    if (metrics.accuracy > 90) {
      items.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Excellent Forecast Accuracy',
        description: `Current accuracy of ${metrics.accuracy.toFixed(1)}% is above target.`,
      });
    }
    
    return items;
  }, [trend, forecastResults, metrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Brain className="h-7 w-7 text-indigo-400" />
            AI Forecasting Engine
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Advanced demand forecasting with machine learning algorithms
            {hasUploadedData && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                <CheckCircle2 size={12} />
                Live Data ({excelData?.orders.length || 0} orders)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
          >
            <Settings2 size={16} />
            Settings
          </button>
          <button
            onClick={exportToExcel}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            Export
          </button>
        </div>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Forecast Settings</h3>
                <button onClick={() => setShowSettings(false)}><X size={18} className="text-slate-400" /></button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-slate-400">Default Method</label>
                  <select
                    value={forecastMethod}
                    onChange={(e) => setForecastMethod(e.target.value as ForecastMethod)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    {FORECAST_METHODS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Alpha (Smoothing)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={settings.alpha}
                    onChange={(e) => setSettings(s => ({ ...s, alpha: parseFloat(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Safety Stock Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={settings.safetyStockMultiplier}
                    onChange={(e) => setSettings(s => ({ ...s, safetyStockMultiplier: parseFloat(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material Selector */}
      <div className="flex flex-wrap gap-2">
        {MATERIALS.map((mat) => (
          <button
            key={mat.id}
            onClick={() => setSelectedMaterial(mat.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              selectedMaterial === mat.id
                ? 'bg-indigo-600/30 text-indigo-400 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                : 'border border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="mr-2 opacity-50">{mat.id}</span>
            {mat.description}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        <KPICard
          title="Forecast Accuracy"
          value={`${metrics.accuracy.toFixed(1)}%`}
          subtitle={`MAPE: ${metrics.mape.toFixed(1)}%`}
          icon={Target}
          color={COLORS.primary[0]}
          trend={2.5}
        />
        <KPICard
          title="EOQ (Economic Qty)"
          value={sapEoQ.toLocaleString()}
          subtitle="Optimal Order Size"
          icon={Package}
          color={COLORS.accent[0]}
        />
        <KPICard
          title="Reorder Point (ROP)"
          value={sapRop.toLocaleString()}
          subtitle={`${currentMaterialObj.leadTimeDays || 14}d Lead Time`}
          icon={AlertCircle}
          color={COLORS.warning[0]}
        />
        <KPICard
          title="SAP Safety Stock"
          value={sapSafetyStock.toLocaleString()}
          subtitle={`${((currentMaterialObj.serviceLevel || 0.95) * 100).toFixed(0)}% Service Lvl`}
          icon={Calculator}
          color={COLORS.success[0]}
        />
        <KPICard
          title="Next Month AI Forecast"
          value={nextMonthForecast.toLocaleString()}
          subtitle={`Via ${FORECAST_METHODS.find(m => m.id === forecastMethod)?.label}`}
          icon={Brain}
          color={COLORS.primary[1]}
        />
        <KPICard
          title="Stockout Risk"
          value={`${forecastResults[forecastResults.length - 1]?.stockoutRisk || 0}%`}
          subtitle="Next period"
          icon={AlertTriangle}
          color={(forecastResults[forecastResults.length - 1]?.stockoutRisk || 0) > 30 ? COLORS.danger[0] : COLORS.success[0]}
        />
      </div>

      {/* AI Insights */}
      {showInsights && insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-white">AI Insights</h3>
            </div>
            <button 
              onClick={() => setShowInsights(false)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight, i) => (
              <div 
                key={i}
                className={`rounded-xl border p-3 ${
                  insight.type === 'danger' ? 'border-red-500/30 bg-red-500/10' :
                  insight.type === 'warning' ? 'border-amber-500/30 bg-amber-500/10' :
                  insight.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' :
                  'border-indigo-500/30 bg-indigo-500/10'
                }`}
              >
                <div className="flex items-start gap-2">
                  <insight.icon className={`mt-0.5 h-4 w-4 ${
                    insight.type === 'danger' ? 'text-red-400' :
                    insight.type === 'warning' ? 'text-amber-400' :
                    insight.type === 'success' ? 'text-emerald-400' :
                    'text-indigo-400'
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-white">{insight.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2"
        >
          {/* Chart Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {CHART_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    activeChartTab === tab.id
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Chart Content */}
          <div className="h-[340px]">
            {activeChartTab === 'forecast' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v: string) => <span className="text-sm text-slate-400">{v}</span>} />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#8b5cf6" strokeWidth={2} fill="url(#fGrad)" dot={{ fill: '#8b5cf6', r: 4 }} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#06b6d4" strokeWidth={2} fill="url(#aGrad)" dot={{ fill: '#06b6d4', r: 4 }} connectNulls={false} />
                  <Bar dataKey="replenishment" name="Replenishment" fill="#f59e0b" opacity={0.6} radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            
            {activeChartTab === 'trend' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="closing" name="Closing Stock" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <ReferenceLine y={forecastResults[0]?.safetyStock} label="Safety Stock" stroke="#ef4444" strokeDasharray="3 3" />
                  {trend.direction !== 'stable' && chartData.length > 1 && (
                    <ReferenceLine 
                      segment={[{ x: chartData[0]?.month, y: historicalSales[0] || 0 }, { x: chartData[chartData.length - 1]?.month, y: nextMonthForecast }]} 
                      stroke="#6366f1" 
                      strokeDasharray="5 5"
                      label="Trend"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {activeChartTab === 'accuracy' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.filter((d: any) => d.actual)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="accuracy" name="Accuracy %" radius={[4, 4, 0, 0]}>
                    {chartData.filter((d: any) => d.actual).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.accuracy >= 90 ? '#10b981' : entry.accuracy >= 80 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                  <ReferenceLine y={80} label="Target" stroke="#10b981" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {activeChartTab === 'distribution' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accuracyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* What-If Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-white">What-If Scenario</h3>
            </div>
            <button
              onClick={() => setShowScenario(!showScenario)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                showScenario 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {showScenario ? 'Active' : 'Disabled'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Demand Adjustment */}
            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Demand Adjustment</span>
                <span className={`font-bold ${demandAdjust >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {demandAdjust > 0 ? '+' : ''}{demandAdjust}%
                </span>
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={demandAdjust}
                onChange={(e) => { setDemandAdjust(Number(e.target.value)); setShowScenario(true); }}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-indigo-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>-50%</span>
                <span>Baseline</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Safety Stock Adjustment */}
            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Safety Stock Adjustment</span>
                <span className={`font-bold ${safetyAdjust >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {safetyAdjust > 0 ? '+' : ''}{safetyAdjust}%
                </span>
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={safetyAdjust}
                onChange={(e) => { setSafetyAdjust(Number(e.target.value)); setShowScenario(true); }}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>-50%</span>
                <span>Baseline</span>
                <span>+50%</span>
              </div>
            </div>

            {/* Quick Scenarios */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Quick Scenarios</p>
              <div className="flex flex-wrap gap-2">
                {scenarios.slice(0, 3).map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setDemandAdjust(s.demandAdjustment); setSafetyAdjust(s.safetyStockAdjustment); setShowScenario(true); }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
                    title={s.description}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={saveScenario}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => { setDemandAdjust(0); setSafetyAdjust(0); setShowScenario(false); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {/* Scenario Impact */}
            {showScenario && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 border-t border-white/5 pt-4"
              >
                <p className="text-xs font-medium text-slate-500">Scenario Impact (Next Month)</p>
                <div className="space-y-2 rounded-xl bg-white/5 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Adjusted Forecast</span>
                    <span className="font-bold text-white">{forecastResults[forecastResults.length - 1]?.forecastDemand.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Replenishment Needed</span>
                    <span className="font-bold text-cyan-400">{forecastResults[forecastResults.length - 1]?.replenishmentQty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Stockout Risk</span>
                    <span className={`font-bold ${(forecastResults[forecastResults.length - 1]?.stockoutRisk || 0) > 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {forecastResults[forecastResults.length - 1]?.stockoutRisk}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Method Comparison & Forecasting Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <SectionHeader 
          title="Forecasting Methods" 
          subtitle="Compare different algorithms and select the best fit"
        />
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FORECAST_METHODS.map(method => {
            const forecastValue = generateForecast(historicalSales, { 
              method: method.id, 
              periods: 3,
              alpha: settings.alpha,
              beta: settings.beta,
            });
            const isSelected = forecastMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setForecastMethod(method.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${isSelected ? 'text-indigo-400' : 'text-white'}`}>
                      {method.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{method.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{forecastValue.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Next month</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400">
                    <CheckCircle2 size={12} />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
      >
        <div className="border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Replenishment Recommendations</h3>
              <p className="text-sm text-slate-400">Auto-calculated supply requirements per month</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Optimal
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Caution
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Critical
              </span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500">Month</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Opening</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">In Transit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Sales</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Forecast</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Closing</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Replenish</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Accuracy</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500">Risk</th>
              </tr>
            </thead>
            <tbody>
              {forecastResults.map((r, i) => (
                <motion.tr
                  key={r.month}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="border-t border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-3 font-medium text-slate-300">{r.month}</td>
                  <td className="px-6 py-3 text-right text-slate-400">{r.openingStock.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-400">{r.stockInTransit.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-slate-300">{r.actualSales > 0 ? r.actualSales.toLocaleString() : '—'}</td>
                  <td className="px-6 py-3 text-right font-medium text-indigo-400">{r.forecastDemand.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-semibold text-white">{r.closingStock.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right">
                    {r.replenishmentQty > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400">
                        {r.replenishmentQty.toLocaleString()}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {r.actualSales > 0 ? (
                      <span className={r.forecastAccuracy >= 90 ? 'text-emerald-400' : r.forecastAccuracy >= 80 ? 'text-amber-400' : 'text-red-400'}>
                        {r.forecastAccuracy.toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className={r.stockoutRisk > 30 ? 'text-red-400' : r.stockoutRisk > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                      {r.stockoutRisk}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
