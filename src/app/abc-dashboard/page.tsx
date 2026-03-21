'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, LineChart, Line, ReferenceLine 
} from 'recharts';
import { 
  Package, AlertTriangle, TrendingUp, DollarSign, Layers, 
  Filter, Download, ChevronDown, ChevronUp, Search, Info,
  AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Grid3X3, BarChart3, PieChart as PieChartIcon, Calendar,
  Clock, Settings, X, Menu, ChevronLeft, ChevronRight,
  RefreshCw, Sparkles, Warehouse
} from 'lucide-react';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import { 
  performABCAnalysis, 
  getABCSummary, 
  calculateClosingStock,
  getInventoryAgeConfig,
  setInventoryAgeConfig,
  AGE_CONFIG_PRESETS,
  type InventoryAgeConfig,
  type ABCAnalysisResult
} from '@/lib/forecasting';

// Colors for ABC classification
const ABC_COLORS = {
  A: { bg: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-100', border: 'border-emerald-500' },
  B: { bg: 'bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-100', border: 'border-amber-500' },
  C: { bg: 'bg-red-500', text: 'text-red-600', lightBg: 'bg-red-100', border: 'border-red-500' },
};

const AGE_COLORS = {
  good: { bg: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-100' },
  slow: { bg: 'bg-orange-500', text: 'text-orange-600', lightBg: 'bg-orange-100' },
  bad: { bg: 'bg-red-500', text: 'text-red-600', lightBg: 'bg-red-100' },
};

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

// KPICard Component - Mobile optimized
const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, onClick, isActive }: any) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
      isActive 
        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-500/10` 
        : 'border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-600'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate">{title}</p>
        <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 truncate">{subtitle}</p>}
      </div>
      <div 
        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 ml-2`}
        style={{ background: `${color}15`, color }}
      >
        <Icon size={18} />
      </div>
    </div>
    {trend !== undefined && (
      <div className="mt-2 flex items-center gap-1">
        {trend > 0 ? (
          <ArrowUpRight size={12} className="text-emerald-500" />
        ) : trend < 0 ? (
          <ArrowDownRight size={12} className="text-red-500" />
        ) : null}
        <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-400">vs last</span>
      </div>
    )}
  </motion.div>
);

// Mobile Card Component for table view
const MobileCard = ({ item, onClick }: { item: ABCAnalysisResult; onClick?: () => void }) => {
  const ageConfig = getInventoryAgeConfig();
  const ageInfo = {
    good: { label: 'Good', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400' },
    slow: { label: 'Slow', color: 'text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400' },
    bad: { label: 'Bad', color: 'text-red-600 bg-red-100 dark:bg-red-500/20 dark:text-red-400' },
  }[item.inventoryAgeStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 mb-3 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-white ${ABC_COLORS[item.classification].bg}`}>
            {item.classification}
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.materialId}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{item.materialName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ageInfo.color}`}>
          {ageInfo.label}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500">Category</p>
          <p className="text-gray-700 dark:text-slate-300 truncate">{item.category}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500">Coverage</p>
          <p className={`font-medium ${
            item.stockCoverageMonths < 1 ? 'text-red-600 dark:text-red-400' : 
            item.stockCoverageMonths < 2 ? 'text-orange-600 dark:text-orange-400' : 
            'text-emerald-600 dark:text-emerald-400'
          }`}>
            {item.stockCoverageMonths.toFixed(1)} mo
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500">Stock Gap</p>
          <p className={`font-medium ${item.stockGapUnits > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {item.stockGapUnits > 0 ? item.stockGapUnits.toLocaleString() : '0'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 dark:text-slate-500">Forecast Acc</p>
          <p className="font-medium text-gray-700 dark:text-slate-300">{item.forecastAccuracy.toFixed(0)}%</p>
        </div>
      </div>
    </motion.div>
  );
};

// Detail Modal for mobile
const DetailModal = ({ item, onClose }: { item: ABCAnalysisResult | null; onClose: () => void }) => {
  if (!item) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-900 p-6 max-h-[90vh] overflow-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">SKU Details</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white ${ABC_COLORS[item.classification].bg}`}>
                {item.classification}
              </span>
              <div>
                <p className="font-mono text-sm text-gray-500">{item.materialId}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{item.materialName}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Stock Coverage</p>
                <p className={`text-lg font-bold ${item.stockCoverageMonths < 1 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {item.stockCoverageMonths.toFixed(1)} months
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Current Stock</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.currentStock.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Stock Gap</p>
                <p className={`text-lg font-bold ${item.stockGapUnits > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {item.stockGapUnits > 0 ? item.stockGapUnits.toLocaleString() : '0'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Gap Value</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">${item.stockGapValue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Forecast Accuracy</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.forecastAccuracy.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <p className="text-xs text-gray-500">Inventory Age</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{item.inventoryAgeDays} days</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Age Config Modal
const AgeConfigModal = ({ 
  isOpen, 
  onClose, 
  currentConfig, 
  onApply 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentConfig: InventoryAgeConfig;
  onApply: (config: InventoryAgeConfig | string) => void;
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('default');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={20} />
            Inventory Age Configuration
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Select a preset based on your industry standards:
        </p>
        
        <div className="space-y-2 mb-6">
          {Object.entries(AGE_CONFIG_PRESETS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedPreset === key 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white capitalize">{key}</span>
                {selectedPreset === key && <CheckCircle2 size={18} className="text-indigo-500" />}
              </div>
              <div className="mt-2 text-xs text-gray-500 flex gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Good: {config.good.max / 30}mo
                </span>
                <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                  Slow: {config.slow.max ? config.slow.max / 30 : '∞'}mo
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { onApply(selectedPreset); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function ABCDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedAgeStatus, setSelectedAgeStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'totalSalesValue', direction: 'desc' });
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ABCAnalysisResult | null>(null);
  const [showAgeConfig, setShowAgeConfig] = useState(false);
  const [ageConfig, setAgeConfig] = useState<InventoryAgeConfig>(getInventoryAgeConfig());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync age config when Settings page changes it
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setInventoryAgeConfig(detail);
        setAgeConfig(getInventoryAgeConfig());
      }
    };
    window.addEventListener('inventory-age-config-changed', handler);
    return () => window.removeEventListener('inventory-age-config-changed', handler);
  }, []);

  // Prepare data for ABC analysis
  const abcData = useMemo(() => {
    const materialsWithHistory = MATERIALS.map(mat => {
      const history = HISTORICAL_DATA[mat.id] || [];
      const historicalSales = history.map(h => h.actualSales).filter(s => s > 0);
      const historicalForecasts = history.map(h => h.forecast);
      const latest = history[history.length - 1];
      const currentStock = latest ? calculateClosingStock(latest.openingStock, latest.stockInTransit, latest.actualSales) : 0;
      
      return {
        id: mat.id,
        description: mat.description,
        priceUSD: mat.priceUSD,
        category: mat.category || 'Uncategorized',
        historicalSales,
        historicalForecasts,
        currentStock,
        batchDate: mat.batchDate,
        expiryDate: mat.expiryDate,
        forecastDemand: latest?.forecast || 0,
      };
    });
    
    return performABCAnalysis(materialsWithHistory);
  }, [ageConfig]);

  // Calculate summary statistics
  const summary = useMemo(() => getABCSummary(abcData), [abcData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = abcData;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedClass !== 'All') {
      filtered = filtered.filter(item => item.classification === selectedClass);
    }
    
    if (selectedAgeStatus !== 'All') {
      filtered = filtered.filter(item => item.inventoryAgeStatus === selectedAgeStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
    
    return filtered;
  }, [abcData, selectedCategory, selectedClass, selectedAgeStatus, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate totals for filtered data
  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => ({
      avgMonthlySalesValue: acc.avgMonthlySalesValue + item.avgMonthlySalesValue,
      stockValue: acc.stockValue + (item.stockValue ?? 0),
      stockGapUnits: acc.stockGapUnits + item.stockGapUnits,
      stockGapValue: acc.stockGapValue + item.stockGapValue,
    }), {
      avgMonthlySalesValue: 0,
      stockValue: 0,
      stockGapUnits: 0,
      stockGapValue: 0,
    });
  }, [filteredData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(abcData.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [abcData]);

  // Chart data
  const abcDistributionData = [
    { name: 'A Class', value: summary.a.count, color: '#10b981', salesValue: summary.a.totalValue },
    { name: 'B Class', value: summary.b.count, color: '#f59e0b', salesValue: summary.b.totalValue },
    { name: 'C Class', value: summary.c.count, color: '#ef4444', salesValue: summary.c.totalValue },
  ];

  const ageDistributionData = [
    { name: 'Good (0-6mo)', value: abcData.filter(i => i.inventoryAgeStatus === 'good').length, color: '#10b981' },
    { name: 'Slow (6-12mo)', value: abcData.filter(i => i.inventoryAgeStatus === 'slow').length, color: '#f97316' },
    { name: 'Bad (12mo+)', value: abcData.filter(i => i.inventoryAgeStatus === 'bad').length, color: '#ef4444' },
  ];

  const coverageByClassData = [
    { name: 'A Class', coverage: summary.a.avgCoverage, threshold: 1 },
    { name: 'B Class', coverage: summary.b.avgCoverage, threshold: 1 },
    { name: 'C Class', coverage: summary.c.avgCoverage, threshold: 1 },
  ];

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleAgeConfigApply = (preset: string | InventoryAgeConfig) => {
    setInventoryAgeConfig(preset);
    setAgeConfig(getInventoryAgeConfig());
  };

  const handleExport = useCallback(async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      // ABC Analysis Sheet
      const rows = filteredData.map(item => ({
        'ABC Class': item.classification,
        'SKU ID': item.materialId,
        'Description': item.materialName,
        'Category': item.category,
        'Avg Monthly Sales (Units)': item.avgMonthlySales,
        'Avg Monthly Sales Value ($)': item.avgMonthlySalesValue.toFixed(2),
        'Contribution (%)': item.salesValueContribution.toFixed(2),
        'Cumulative (%)': item.cumulativeContribution.toFixed(2),
        'Stock Value ($)': (item.stockValue || 0).toFixed(2),
        'Coverage (Months)': item.stockCoverageMonths.toFixed(2),
        'Stock Gap (Units)': item.stockGapUnits,
        'Gap Value ($)': item.stockGapValue.toFixed(2),
        'Forecast Accuracy (%)': item.forecastAccuracy.toFixed(1),
        'Age Status': item.inventoryAgeStatus === 'good' ? 'Good' : item.inventoryAgeStatus === 'slow' ? 'Slow Moving' : 'Bad Inventory',
        'Age (Days)': item.inventoryAgeDays,
        'Status': item.stockCoverageMonths < 1 ? 'Action for Provision' : item.stockCoverageMonths < 2 ? 'Action for Sales' : 'Healthy',
      }));

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'ABC Analysis');

      // Summary Sheet
      const lowCoverageA = abcData.filter(r => r.classification === 'A' && r.stockCoverageMonths < 1).length;
      const lowCoverageB = abcData.filter(r => r.classification === 'B' && r.stockCoverageMonths < 1).length;
      const lowCoverageC = abcData.filter(r => r.classification === 'C' && r.stockCoverageMonths < 1).length;
      const summaryRows = [
        ['Class', 'SKU Count', 'Total Sales Value ($)', 'Avg Coverage (Months)', 'Low Coverage SKUs'],
        ['A', summary.a.count, summary.a.totalValue.toFixed(2), summary.a.avgCoverage.toFixed(2), lowCoverageA],
        ['B', summary.b.count, summary.b.totalValue.toFixed(2), summary.b.avgCoverage.toFixed(2), lowCoverageB],
        ['C', summary.c.count, summary.c.totalValue.toFixed(2), summary.c.avgCoverage.toFixed(2), lowCoverageC],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary');

      XLSX.writeFile(wb, `ABC_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [filteredData, summary]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <Layers className="h-6 w-6 text-indigo-500" />
                ABC Analysis Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                SKU classification and stock coverage analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAgeConfig(true)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Age Config</span>
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
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
          <KPICard
            title="Total SKUs"
            value={abcData.length}
            subtitle={`Avg: ${(abcData.reduce((sum, a) => sum + a.stockCoverageMonths, 0) / abcData.length).toFixed(1)} mo coverage`}
            icon={Package}
            color="#6366f1"
            isActive={selectedKPI === 'total'}
            onClick={() => setSelectedKPI(selectedKPI === 'total' ? null : 'total')}
          />
          <KPICard
            title="Low Coverage SKUs"
            value={summary.lowCoverage.count}
            subtitle={summary.lowCoverage.count > 0 ? 'Less than 1 month' : 'All healthy'}
            icon={AlertTriangle}
            color={summary.lowCoverage.count > 0 ? '#ef4444' : '#10b981'}
            isActive={selectedKPI === 'lowCoverage'}
            onClick={() => setSelectedKPI(selectedKPI === 'lowCoverage' ? null : 'lowCoverage')}
          />
          <KPICard
            title="Avg Forecast Accuracy"
            value={`${(abcData.reduce((sum, a) => sum + a.forecastAccuracy, 0) / abcData.length).toFixed(0)}%`}
            subtitle="M-1 previous month actuals"
            icon={TrendingUp}
            color="#3b82f6"
          />
          <KPICard
            title="Total Stock Value"
            value={(() => {
              const total = abcData.reduce((sum, a) => sum + (a.stockValue ?? 0), 0);
              return total >= 1000000 ? `$${(total / 1000000).toFixed(1)}M` : `$${(total / 1000).toFixed(1)}k`;
            })()}
            subtitle="Current inventory"
            icon={DollarSign}
            color="#8b5cf6"
          />
        </div>

        {/* Low Coverage Alert */}
        {summary.lowCoverage.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-400">
                  {summary.lowCoverage.count} SKU{summary.lowCoverage.count > 1 ? 's' : ''} with Low Coverage
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  These SKUs have less than 1 month of stock coverage and need immediate attention.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.lowCoverage.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-xs font-medium text-red-700 dark:text-red-400"
                    >
                      {item.sku} · {item.name} · {item.category} ({item.coverage.toFixed(1)} mo)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* ABC Distribution */}
          <motion.div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">ABC Distribution</h3>
            <div className="h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={abcDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {abcDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                <p className="text-xs text-gray-500">A Class</p>
                <p className="text-lg font-bold text-emerald-600">80%</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 p-2">
                <p className="text-xs text-gray-500">B Class</p>
                <p className="text-lg font-bold text-amber-600">15%</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                <p className="text-xs text-gray-500">C Class</p>
                <p className="text-lg font-bold text-red-600">5%</p>
              </div>
            </div>
          </motion.div>

          {/* Inventory Age Distribution */}
          <motion.div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Inventory Age</h3>
              <button 
                onClick={() => setShowAgeConfig(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <Settings size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => value > 0 ? `${value}` : ''}
                    labelLine={false}
                  >
                    {ageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                <p className="text-xs text-gray-500">Good</p>
                <p className="text-sm font-medium text-emerald-600">0-6 mo</p>
              </div>
              <div className="rounded-lg bg-orange-50 dark:bg-orange-500/10 p-2">
                <p className="text-xs text-gray-500">Slow</p>
                <p className="text-sm font-medium text-orange-600">6-12 mo</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-2">
                <p className="text-xs text-gray-500">Bad</p>
                <p className="text-sm font-medium text-red-600">12+ mo</p>
              </div>
            </div>
          </motion.div>

          {/* Coverage by Class */}
          <motion.div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Avg Coverage by Class</h3>
            <div className="h-[250px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageByClassData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Bar>
                  <ReferenceLine x={1} stroke="#ef4444" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              Red dashed line = 1 month threshold
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Filter size={18} />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2 flex-1">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="All">All Classes</option>
                <option value="A">Class A</option>
                <option value="B">Class B</option>
                <option value="C">Class C</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedAgeStatus}
                onChange={(e) => setSelectedAgeStatus(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="All">All Ages</option>
                <option value="good">Good (0-6mo)</option>
                <option value="slow">Slow (6-12mo)</option>
                <option value="bad">Bad (12mo+)</option>
              </select>

              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">View:</span>
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-700 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-md p-1.5 ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`rounded-md p-1.5 ${viewMode === 'chart' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <BarChart3 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="space-y-3">
            {paginatedData.map((item) => (
              <MobileCard 
                key={item.materialId} 
                item={item} 
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
          
          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <motion.div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">ABC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700" onClick={() => handleSort('materialId')}>
                    SKU ID {sortConfig.key === 'materialId' && (sortConfig.direction === 'desc' ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700" onClick={() => handleSort('avgMonthlySalesValue')}>
                    Avg Monthly Value {sortConfig.key === 'avgMonthlySalesValue' && (sortConfig.direction === 'desc' ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Contribution</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Stock Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700" onClick={() => handleSort('stockCoverageMonths')}>
                    Coverage {sortConfig.key === 'stockCoverageMonths' && (sortConfig.direction === 'desc' ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Stock Gap</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Gap Value</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Forecast Acc</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400">Age Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row */}
                <tr className="bg-indigo-50/50 dark:bg-indigo-500/10 border-t border-gray-100 dark:border-slate-800">
                  <td className="px-4 py-3 text-center" colSpan={4}>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">TOTAL</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    ${totals.avgMonthlySalesValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    ${totals.stockValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-amber-600 dark:text-amber-400">
                    {totals.stockGapUnits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                    ${totals.stockGapValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3" colSpan={2}></td>
                </tr>
                {paginatedData.map((item, i) => (
                  <motion.tr
                    key={item.materialId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className={`border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 ${item.classification === 'A' && item.stockCoverageMonths < 1 ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-white ${ABC_COLORS[item.classification].bg}`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{item.materialId}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.materialName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">${item.avgMonthlySalesValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-slate-700">
                          <div 
                            className="h-full rounded-full transition-all bg-indigo-500"
                            style={{ width: `${Math.min(item.salesValueContribution * 2, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-600 dark:text-slate-400 text-xs">{item.salesValueContribution.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      ${(item.stockValue ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        item.stockCoverageMonths < 1 ? 'text-red-600 dark:text-red-400' : 
                        item.stockCoverageMonths < 2 ? 'text-orange-600 dark:text-orange-400' : 
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.stockCoverageMonths.toFixed(1)} mo
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${item.stockGapUnits > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.stockGapUnits > 0 ? item.stockGapUnits.toLocaleString() : '0'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {item.stockGapValue > 0 ? `$${item.stockGapValue.toLocaleString()}` : '$0'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${item.forecastAccuracy >= 90 ? 'text-emerald-600 dark:text-emerald-400' : item.forecastAccuracy >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.forecastAccuracy.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.inventoryAgeStatus === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        item.inventoryAgeStatus === 'slow' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {item.inventoryAgeStatus === 'good' ? 'Good' : item.inventoryAgeStatus === 'slow' ? 'Slow' : 'Bad'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.stockCoverageMonths < 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/20 dark:text-red-400">
                          <AlertCircle size={12} />
                          Action for Provision
                        </span>
                      ) : item.stockCoverageMonths < 2 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                          <AlertTriangle size={12} />
                          Action for Sales
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          Healthy
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-emerald-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">A Class (80% value)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">B Class (15% value)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">C Class (5% value)</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">Out of Stock</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-slate-400">Coverage &lt; 1 month</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <AgeConfigModal 
        isOpen={showAgeConfig} 
        onClose={() => setShowAgeConfig(false)}
        currentConfig={ageConfig}
        onApply={handleAgeConfigApply}
      />
    </div>
  );
}
