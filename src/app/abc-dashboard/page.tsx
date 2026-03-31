'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, TrendingUp, Package, AlertCircle, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Download, Filter, Settings,
  BarChart3, Activity, Sparkles, Search, X, ShieldAlert,
  DollarSign, Grid3X3, Layers, Info, RefreshCw,
  TrendingDown, Zap, ChevronRight, Target, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '@/lib/DataContext';
import { 
  performABCAnalysis, 
  getABCSummary,
  getInventoryAgeMasterConfig,
  setInventoryAgeMasterConfig,
  InventoryAgeMasterConfig,
} from '@/lib/forecasting';
import { LoadingScreen } from '@/components/ui/loading-screen';
import FloatingCard3D from '@/components/3d/FloatingCard3D';
import ParticleBackground from '@/components/3d/ParticleBackground';
import PieChartComponent from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import AreaChart from '@/components/charts/AreaChart';
import RadarChart from '@/components/charts/RadarChart';
import { getUploadedData, UploadedData } from '@/lib/uploadDataStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AgeConfigModal({ isOpen, onClose, config, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  config: InventoryAgeMasterConfig;
  onSave: (config: InventoryAgeMasterConfig) => void;
}) {
  const [localConfig, setLocalConfig] = useState<InventoryAgeMasterConfig>(config);
  useEffect(() => { setLocalConfig(config); }, [config, isOpen]);
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Age Configuration</h3>
                <p className="text-sm text-slate-400">Master-driven classification</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-emerald-400">Good Inventory</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min (months)</label>
                  <input type="number" value={localConfig.goodMinMonths} onChange={(e) => setLocalConfig({ ...localConfig, goodMinMonths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max (months)</label>
                  <input type="number" value={localConfig.goodMaxMonths} onChange={(e) => setLocalConfig({ ...localConfig, goodMaxMonths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-emerald-500/50 outline-none transition-colors" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-medium text-amber-400">Slow Moving</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min (months)</label>
                  <input type="number" value={localConfig.slowMinMonths} onChange={(e) => setLocalConfig({ ...localConfig, slowMinMonths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500/50 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max (months)</label>
                  <input type="number" value={localConfig.slowMaxMonths} onChange={(e) => setLocalConfig({ ...localConfig, slowMaxMonths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500/50 outline-none transition-colors" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="font-medium text-rose-400">Bad Inventory</span>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Min (months)</label>
                <input type="number" value={localConfig.badMinMonths} onChange={(e) => setLocalConfig({ ...localConfig, badMinMonths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-rose-500/50 outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
            <button onClick={() => onSave(localConfig)} className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/25">Save</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, onClick, tooltip }: any) {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    slate: 'from-slate-500 to-slate-600 shadow-slate-500/30',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/30',
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={onClick}
      title={tooltip}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl opacity-0 hover:opacity-30 blur transition duration-500`} />
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-10 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:opacity-20 transition-opacity`} />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{title}</p>
              <p className={`text-3xl font-bold text-${color}-400 mt-2`}>{value}</p>
              {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
          </div>
        </div>
        {onClick && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-slate-500">Click for details</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: 'good' | 'slow' | 'bad' }) {
  const config = {
    good: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Healthy', icon: CheckCircle2, tooltip: 'Healthy inventory status' },
    slow: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Action for Sales', icon: Activity, tooltip: 'Action required from Sales team' },
    bad: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Action for Provision', icon: AlertCircle, tooltip: 'Action required for provision/write-off' },
  };
  const { color, label, icon: Icon, tooltip } = config[status];
  return (
    <span title={tooltip} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
}

function ABCBadge({ classification }: { classification: 'A' | 'B' | 'C' }) {
  const colors = {
    A: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30 shadow-emerald-500/20',
    B: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/30 shadow-amber-500/20',
    C: 'bg-gradient-to-r from-slate-500 to-slate-400 text-white border-slate-400/30 shadow-slate-500/20',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-lg ${colors[classification]}`}>
      {classification}
    </span>
  );
}

export default function ABCDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', abcClass: 'all', status: 'all', search: '' });
  const [showAgeConfig, setShowAgeConfig] = useState(false);
  const [showLowCoverageModal, setShowLowCoverageModal] = useState(false);
  const [ageConfig, setAgeConfig] = useState<InventoryAgeMasterConfig>(getInventoryAgeMasterConfig());
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const { materials, historicalData, hasUploadedData } = useData();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setUploadedData(getUploadedData());
    }, 800);
  }, []);

  const materialsForABC = useMemo(() => {
    // Use uploaded materials when available
    if (hasUploadedData && materials.length > 0) {
      return materials.map(m => {
        const history = historicalData[m.id] || [];
        const latest = history[history.length - 1] || { openingStock: 1000, stockInTransit: 200, actualSales: 500, forecast: 500 };
        const currentStock = latest.openingStock + latest.stockInTransit - latest.actualSales;
        const monthlySales = history.map((h: any) => h.actualSales).filter((s: number) => s > 0);
        return {
          id: m.id,
          description: m.description,
          priceUSD: Math.max(m.priceUSD || 1, 1),
          category: m.category || 'Uncategorized',
          historicalSales: monthlySales.length > 0 ? monthlySales : [latest.actualSales || 0],
          historicalForecasts: history.map((h: any) => h.forecast || 0),
          currentStock: currentStock > 0 ? currentStock : 0,
          batchDate: (m as any).batchDate as string | undefined,
          expiryDate: (m as any).expiryDate as string | undefined,
          forecastDemand: latest.forecast || 0,
        };
      });
    }
    return [];
  }, [materials, historicalData, hasUploadedData]);

  const abcResults = useMemo(() => performABCAnalysis(materialsForABC), [materialsForABC]);
  
  const filteredResults = useMemo(() => {
    return abcResults.filter(item => {
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.abcClass !== 'all' && item.classification !== filters.abcClass) return false;
      if (filters.status !== 'all' && item.inventoryAgeStatus !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return item.materialId.toLowerCase().includes(searchLower) ||
               item.materialName.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [abcResults, filters]);

  const summary = useMemo(() => getABCSummary(filteredResults), [filteredResults]);
  const categories = ['all', ...Array.from(new Set(abcResults.map(r => r.category)))];

  const coverageData = useMemo(() => {
    return filteredResults.slice(0, 10).map(item => ({
      name: item.materialId,
      coverage: item.stockCoverageMonths,
      target: 2,
    }));
  }, [filteredResults]);

  const ageDistribution = useMemo(() => {
    const counts = { good: 0, slow: 0, bad: 0 };
    filteredResults.forEach(item => {
      counts[item.inventoryAgeStatus]++;
    });
    return [
      { name: 'Good', value: counts.good },
      { name: 'Slow', value: counts.slow },
      { name: 'Bad', value: counts.bad },
    ];
  }, [filteredResults]);

  const totals = useMemo(() => filteredResults.reduce((acc, item) => ({
    stockValue: acc.stockValue + item.stockValue,
    stockGapValue: acc.stockGapValue + Math.max(0, item.stockGapValue),
    stockGapUnits: acc.stockGapUnits + Math.max(0, item.stockGapUnits),
    count: acc.count + 1,
  }), { stockValue: 0, stockGapValue: 0, stockGapUnits: 0, count: 0 }), [filteredResults]);

  const handleExportExcel = () => {
    const exportData = filteredResults.map(item => ({
      'SKU Number': item.materialId,
      'Description': item.materialName,
      'Category': item.category,
      'ABC Classification': item.classification,
      'Stock Value ($)': item.stockValue,
      'Coverage (Months)': item.stockCoverageMonths,
      'Avg Monthly Sales': item.avgMonthlySales,
      'Gap (Units)': Math.max(0, item.stockGapUnits),
      'Gap Value ($)': Math.max(0, item.stockGapValue),
      'Inventory Status': item.inventoryAgeStatus === 'good' ? 'Healthy' : item.inventoryAgeStatus === 'slow' ? 'Action for Sales' : 'Action for Provision',
      'Sales Value Contribution (%)': item.salesValueContribution,
    }));
    
    // Add summary row
    exportData.push({
      'SKU Number': 'TOTAL',
      'Description': `${filteredResults.length} items`,
      'Category': '-',
      'ABC Classification': '-' as any,
      'Stock Value ($)': totals.stockValue,
      'Coverage (Months)': 0,
      'Avg Monthly Sales': 0,
      'Gap (Units)': totals.stockGapUnits,
      'Gap Value ($)': Math.max(0, totals.stockGapValue),
      'Inventory Status': '-',
      'Sales Value Contribution (%)': 100,
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ABC Analysis');
    XLSX.writeFile(wb, `ABC_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <LoadingScreen message="Loading ABC Analysis..." />;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <ParticleBackground />
      
      <div className="relative max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ABC Analysis</h1>
              <p className="text-slate-400 text-sm">Inventory classification & coverage analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAgeConfig(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all">
              <Settings className="w-4 h-4" /> Age Config
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/25">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </motion.div>

        {/* Low Coverage Alert */}
        {summary.lowCoverage.count > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="p-3 rounded-xl bg-rose-500/20">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-rose-400">Low Stock Coverage Alert</h4>
              <p className="text-sm text-rose-300/70">{summary.lowCoverage.count} SKU(s) with less than 1 month coverage</p>
            </div>
            <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors">
              View Details
            </button>
          </motion.div>
        )}

        {/* KPI Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Class A Items" value={summary.a.count} subtitle="High value" icon={Layers} color="emerald" onClick={() => setFilters({ ...filters, abcClass: 'A' })} tooltip="Click to filter items by Class A" />
          <StatCard title="Class B Items" value={summary.b.count} subtitle="Medium value" icon={Layers} color="amber" onClick={() => setFilters({ ...filters, abcClass: 'B' })} tooltip="Click to filter items by Class B" />
          <StatCard title="Class C Items" value={summary.c.count} subtitle="Low value" icon={Layers} color="slate" onClick={() => setFilters({ ...filters, abcClass: 'C' })} tooltip="Click to filter items by Class C" />
          <StatCard 
            title="Low Coverage" 
            value={summary.lowCoverage.count} 
            subtitle="Click to view details" 
            icon={AlertCircle} 
            color="rose" 
            onClick={() => summary.lowCoverage.count > 0 && setShowLowCoverageModal(true)}
            tooltip={summary.lowCoverage.count > 0 ? "Click to view SKU details" : "No low coverage items"}
          />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ABC Distribution */}
          <FloatingCard3D className="h-[350px]" glowColor="rgba(99, 102, 241, 0.2)">
            <div className="p-5 h-full">
              <h3 className="text-lg font-semibold text-white mb-1">ABC Distribution</h3>
              <p className="text-sm text-slate-400 mb-4">Value classification breakdown</p>
              <PieChartComponent 
                data={[
                  { name: 'Class A', value: summary.a.count },
                  { name: 'Class B', value: summary.b.count },
                  { name: 'Class C', value: summary.c.count },
                ]}
                height={240}
                donut={true}
                colors={['#10b981', '#f59e0b', '#64748b']}
              />
            </div>
          </FloatingCard3D>

          {/* Age Distribution */}
          <FloatingCard3D className="h-[350px]" glowColor="rgba(245, 158, 11, 0.2)">
            <div className="p-5 h-full">
              <h3 className="text-lg font-semibold text-white mb-1">Age Distribution</h3>
              <p className="text-sm text-slate-400 mb-4">Inventory health status</p>
              <PieChartComponent 
                data={ageDistribution}
                height={240}
                donut={true}
                colors={['#10b981', '#f59e0b', '#ef4444']}
              />
            </div>
          </FloatingCard3D>

          {/* Coverage Analysis */}
          <FloatingCard3D className="h-[350px] lg:col-span-1" glowColor="rgba(236, 72, 153, 0.2)">
            <div className="p-5 h-full">
              <h3 className="text-lg font-semibold text-white mb-1">Stock Coverage</h3>
              <p className="text-sm text-slate-400 mb-4">Top SKUs coverage (months)</p>
              <BarChart 
                data={coverageData}
                height={240}
                horizontal={true}
                colors={['#6366f1']}
              />
            </div>
          </FloatingCard3D>
        </div>

        {/* ABC Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white">ABC Analysis Results</h3>
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">{filteredResults.length} items</span>
            </div>
            <div className="flex items-center gap-2">
              {filters.abcClass !== 'all' && (
                <button 
                  onClick={() => setFilters({ ...filters, abcClass: 'all' })}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors border border-indigo-500/30"
                >
                  Class {filters.abcClass} <X className="w-3 h-3" />
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search SKU, name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Total Row - Updates with filters */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border-b border-indigo-500/30 px-4 py-3">
            <div className="grid grid-cols-12 gap-4 text-sm items-center">
              <div className="col-span-2 font-bold text-indigo-300">TOTAL ({totals.count})</div>
              <div className="col-span-3 text-indigo-400 text-xs">Filtered Results</div>
              <div className="col-span-1 text-center font-bold text-emerald-300">-</div>
              <div className="col-span-2 text-right font-bold text-indigo-300">${(totals.stockValue / 1000).toFixed(1)}k</div>
              <div className="col-span-1 text-center font-bold text-violet-300">-</div>
              <div className="col-span-2 text-right font-bold text-rose-300">${Math.max(0, totals.stockGapValue / 1000).toFixed(1)}k</div>
              <div className="col-span-1 text-center">-</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Brand</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">ABC</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Stock Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Coverage (Mo)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Gap (Units)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Gap Value</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((item, idx) => (
                  <motion.tr
                    key={item.materialId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{item.materialId}</td>
                    <td className="px-4 py-3 text-white font-medium">{item.materialName}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.category}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">Tenchi</td>
                    <td className="px-4 py-3 text-center"><ABCBadge classification={item.classification} /></td>
                    <td className="px-4 py-3 text-right text-slate-300">${item.stockValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${item.stockCoverageMonths < 1 ? 'text-rose-400' : item.stockCoverageMonths < 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.stockCoverageMonths.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {Math.max(0, item.stockGapUnits).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      ${Math.max(0, item.stockGapValue).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={item.inventoryAgeStatus} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Top Materials Radar Chart - shown when uploaded data is available */}
        {uploadedData?.radarData && uploadedData.radarData.length > 0 && uploadedData.radarKeys && uploadedData.radarKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FloatingCard3D className="h-[380px]" glowColor="rgba(99, 102, 241, 0.2)">
              <div className="p-5 h-full">
                <h3 className="text-lg font-semibold text-white mb-1">Top Materials Comparison</h3>
                <p className="text-sm text-slate-400 mb-3">Top 5 SKUs across key metrics (normalized to 100)</p>
                <RadarChart
                  data={uploadedData.radarData}
                  keys={uploadedData.radarKeys}
                  height={290}
                  colors={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
                />
              </div>
            </FloatingCard3D>
          </motion.div>
        )}

        <AgeConfigModal isOpen={showAgeConfig} onClose={() => setShowAgeConfig(false)} config={ageConfig} onSave={setAgeConfig} />
        
        {/* Low Coverage Modal */}
        <LowCoverageModal 
          isOpen={showLowCoverageModal} 
          onClose={() => setShowLowCoverageModal(false)} 
          items={summary.lowCoverage.items}
        />
      </div>
    </div>
  );
}

// Low Coverage Details Modal
function LowCoverageModal({ isOpen, onClose, items }: { isOpen: boolean; onClose: () => void; items: Array<{ sku: string; name: string; category: string; coverage: number }> }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Low Stock Coverage Alert</h3>
                <p className="text-sm text-slate-400">SKUs with less than 1 month of coverage</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="bg-white/5 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">SKU Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Coverage (Months)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <motion.tr
                    key={item.sku}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-t border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{item.sku}</td>
                    <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{item.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-rose-400">{item.coverage.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Critical
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
