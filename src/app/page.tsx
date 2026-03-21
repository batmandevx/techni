'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Upload, 
  Settings,
  Sparkles,
  Bot,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  Zap,
  Target,
  Activity,
  PieChart,
  MoreHorizontal,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Shield,
  Award,
  Command,
  HelpCircle,
  Mail,
  FileText,
  TrendingDown,
  Boxes,
  ShoppingCart,
  UserCheck,
  Layers,
  Wand2,
  Plus,
  Minus,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Badge, StatCard } from '@/components/ui';
import { useData } from '@/lib/DataContext';
import { performABCAnalysis, calculateForecastAccuracy } from '@/lib/forecasting';
import { MATERIALS, HISTORICAL_DATA, MONTHS } from '@/lib/mock-data';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LiveActivity } from '@/components/dashboard/LiveActivity';
import { TodoList } from '@/components/dashboard/TodoList';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { ComparisonWidget } from '@/components/dashboard/ComparisonWidget';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { OnboardingTour } from '@/components/dashboard/OnboardingTour';
import { RealtimeStatus } from '@/components/dashboard/RealtimeStatus';
import { ExportWidget } from '@/components/dashboard/ExportWidget';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { RecentSearches } from '@/components/dashboard/RecentSearches';
import { WelcomeModal } from '@/components/dashboard/WelcomeModal';

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Sparkline chart component
function Sparkline({ data, color = "#6366f1", height = 40 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`M0,${height} L${points} L100,${height} Z`}
        fill={`url(#gradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

// KPI Card with sparkline
function KPICardEnhanced({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon, 
  color,
  sparklineData,
  subtitle,
  onClick
}: { 
  title: string; 
  value: React.ReactNode; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any; 
  color: string;
  sparklineData?: number[];
  subtitle?: string;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              changeType === 'positive' ? 'text-emerald-600' : 
              changeType === 'negative' ? 'text-rose-600' : 'text-gray-500'
            }`}>
              {changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : 
               changeType === 'negative' ? <ArrowDownRight className="w-4 h-4" /> : null}
              {change}
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        
        {sparklineData && (
          <div className="mt-4 h-10">
            <Sparkline data={sparklineData} color={color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : '#f59e0b'} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Activity item component
function ActivityItem({ icon: Icon, title, description, time, color }: { 
  icon: any; 
  title: string; 
  description: string; 
  time: string;
  color: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </motion.div>
  );
}

// Progress bar component
function ProgressBar({ value, max, color = "indigo", label }: { value: number; max: number; color?: string; label: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-slate-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${
            color === 'emerald' ? 'bg-emerald-500' :
            color === 'indigo' ? 'bg-indigo-500' :
            color === 'amber' ? 'bg-amber-500' :
            color === 'rose' ? 'bg-rose-500' :
            'bg-blue-500'
          }`}
        />
      </div>
    </div>
  );
}

// Mini Calendar Widget
function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date().getDate();
  const isCurrentMonth = currentDate.getMonth() === new Date().getMonth();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="text-xs px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-gray-400 font-medium">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => (
          <motion.button
            key={day}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
              isCurrentMonth && day === today
                ? 'bg-indigo-500 text-white font-semibold'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
            }`}
          >
            {day}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Keyboard Shortcuts Help
function KeyboardShortcuts({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', action: 'Command Palette' },
    { key: '⌘/', action: 'Show Shortcuts' },
    { key: 'G', action: 'Go to ABC Dashboard' },
    { key: 'F', action: 'Go to Forecasting' },
    { key: 'O', action: 'Go to Optimizer' },
    { key: 'U', action: 'Go to Upload' },
    { key: 'R', action: 'Refresh Data' },
    { key: 'N', action: 'New Report' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Command className="w-5 h-5" />
              Keyboard Shortcuts
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {shortcuts.map(({ key, action }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
                <span className="text-gray-600 dark:text-slate-400">{action}</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// SKU Details Modal
function SKUDetailsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const abcData = useMemo(() => {
    const materialsWithHistory = MATERIALS.map(mat => {
      const history = HISTORICAL_DATA[mat.id] || [];
      const historicalSales = history.map((h: any) => h.actualSales).filter((s: number) => s > 0);
      const latest = history[history.length - 1];
      const currentStock = latest ? latest.openingStock + latest.stockInTransit - latest.actualSales : 0;
      return { id: mat.id, description: mat.description, priceUSD: mat.priceUSD, category: mat.category || 'Uncategorized', historicalSales, currentStock };
    });
    return performABCAnalysis(materialsWithHistory);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[80vh] shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">SKU Details</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-auto max-h-[60vh] p-6">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">SKU ID</th>
                  <th className="text-left p-3 text-sm font-semibold">Description</th>
                  <th className="text-left p-3 text-sm font-semibold">Class</th>
                  <th className="text-right p-3 text-sm font-semibold">Stock</th>
                  <th className="text-right p-3 text-sm font-semibold">Value</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map((item) => (
                  <tr key={item.materialId} className="border-b border-gray-100 dark:border-slate-700/50">
                    <td className="p-3 text-sm">{item.materialId}</td>
                    <td className="p-3 text-sm">{item.materialName}</td>
                    <td className="p-3">
                      <Badge variant={item.classification === 'A' ? 'danger' : item.classification === 'B' ? 'warning' : 'info'}>
                        Class {item.classification}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-sm">{item.currentStock.toLocaleString()}</td>
                    <td className="p-3 text-right text-sm">${(item.currentStock * item.avgMonthlySalesValue / (item.avgMonthlySales || 1)).toFixed(0)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.stockCoverageMonths < 1 ? 'bg-red-100 text-red-700' :
                        item.stockCoverageMonths < 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.stockCoverageMonths < 1 ? 'Critical' : item.stockCoverageMonths < 2 ? 'Low' : 'Good'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Dashboard() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSKUModal, setShowSKUModal] = useState(false);
  const { orders, customers, kpis } = useData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.ctrlKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate real stats
  const stats = useMemo(() => {
    const materialsWithHistory = MATERIALS.map(mat => {
      const history = HISTORICAL_DATA[mat.id] || [];
      const historicalSales = history.map((h: any) => h.actualSales).filter((s: number) => s > 0);
      const latest = history[history.length - 1];
      const currentStock = latest ? latest.openingStock + latest.stockInTransit - latest.actualSales : 0;
      
      return {
        id: mat.id,
        description: mat.description,
        priceUSD: mat.priceUSD,
        category: mat.category || 'Uncategorized',
        historicalSales,
        currentStock,
      };
    });
    
    const abcData = performABCAnalysis(materialsWithHistory);
    const lowStockCount = abcData.filter(d => d.stockCoverageMonths < 1).length;
    const totalStockValue = abcData.reduce((sum, d) => sum + (d.currentStock * d.avgMonthlySalesValue / (d.avgMonthlySales || 1)), 0);
    
    return {
      totalSKUs: MATERIALS.length,
      lowStockItems: lowStockCount,
      totalStockValue,
      avgForecastAccuracy: 94.2,
      totalOrders: orders.length || 156,
      activeCustomers: 48,
    };
  }, [orders.length]);

  const modules = [
    {
      id: 'abc',
      title: 'ABC Analysis',
      description: 'Classify inventory by value contribution with intelligent insights',
      icon: BarChart3,
      href: '/abc-dashboard',
      color: 'indigo',
      features: ['Smart Classification', 'Stock Coverage', 'Age Analysis'],
      badge: 'Enhanced',
      stats: { value: stats.lowStockItems, label: 'Low Stock Alerts' }
    },
    {
      id: 'forecast',
      title: 'Demand Forecasting',
      description: 'AI-powered demand predictions with 95% accuracy',
      icon: TrendingUp,
      href: '/forecasting',
      color: 'emerald',
      features: ['Seasonal Models', 'Scenario Planning', 'What-if Analysis'],
      badge: 'AI Powered',
      stats: { value: '94.2%', label: 'Accuracy' }
    },
    {
      id: 'optimizer',
      title: 'Order Optimizer',
      description: 'EOQ & reorder optimization with safety stock',
      icon: Package,
      href: '/optimizer',
      color: 'amber',
      features: ['EOQ Calculation', 'Reorder Points', 'Cost Optimization'],
      stats: { value: '8', label: 'Orders to Place' }
    },
    {
      id: 'upload',
      title: 'Data Import',
      description: 'Import Excel & CSV files with smart validation',
      icon: Upload,
      href: '/upload',
      color: 'cyan',
      features: ['Excel Support', 'Data Validation', 'Batch Import'],
      stats: { value: orders.length || 0, label: 'Recent Uploads' }
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Generate & export comprehensive S&OP reports',
      icon: FileSpreadsheet,
      href: '/reports',
      color: 'violet',
      features: ['Custom Reports', 'Export PDF/Excel', 'Scheduled Reports'],
      stats: { value: '12', label: 'Generated' }
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'Get intelligent insights and recommendations',
      icon: Bot,
      href: '/ai-assistant',
      color: 'rose',
      features: ['Natural Language', 'Voice Input', 'File Analysis'],
      badge: 'New',
      stats: { value: '5', label: 'New Insights' }
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] },
    },
  };

  const sparklineData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <WelcomeModal />
      <OnboardingTour />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <SKUDetailsModal isOpen={showSKUModal} onClose={() => setShowSKUModal(false)} />

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  Dashboard
                </motion.h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-slate-300 font-mono">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button 
                onClick={() => setShowShortcuts(true)}
                className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Keyboard Shortcuts (Ctrl+?)"
              >
                <HelpCircle className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              </button>
              <Link href="/auth">
                <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-indigo-100 text-sm font-medium">AI-Powered Insights</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Optimize Your Supply Chain</h2>
              <p className="text-indigo-100 max-w-xl">
                Your inventory forecast accuracy has improved by 12% this month. 
                Review the ABC Analysis to see which SKUs need attention.
              </p>
            </div>
            <Link href="/abc-dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                View Analysis
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Enhanced KPI Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Total SKUs"
              value={<AnimatedCounter value={stats.totalSKUs} />}
              change="+12"
              changeType="positive"
              icon={Boxes}
              color="indigo"
              sparklineData={sparklineData}
              subtitle="Active inventory items"
              onClick={() => setShowSKUModal(true)}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Forecast Accuracy"
              value={`${stats.avgForecastAccuracy}%`}
              change="+3.5%"
              changeType="positive"
              icon={Target}
              color="emerald"
              sparklineData={[70, 75, 72, 80, 85, 88, 90, 92, 94, 94.2]}
              subtitle="Based on M-1 actuals"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Low Stock Items"
              value={stats.lowStockItems}
              change={stats.lowStockItems > 0 ? "Action needed" : "All good"}
              changeType={stats.lowStockItems > 0 ? "negative" : "positive"}
              icon={AlertCircle}
              color="amber"
              sparklineData={[5, 4, 6, 3, 4, stats.lowStockItems]}
              subtitle="Below 1 month coverage"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Stock Value"
              value={`$${(stats.totalStockValue / 1000).toFixed(1)}k`}
              change="+8.2%"
              changeType="neutral"
              icon={DollarSign}
              color="violet"
              sparklineData={[45, 48, 52, 50, 55, 58, 62, 65, 68, 68.4]}
              subtitle="Current inventory value"
            />
          </motion.div>
        </motion.div>

        {/* Additional KPI Row */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Total Orders"
              value={<AnimatedCounter value={stats.totalOrders} />}
              change="+23"
              changeType="positive"
              icon={ShoppingCart}
              color="blue"
              subtitle="This month"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="Active Customers"
              value={stats.activeCustomers}
              change="+5"
              changeType="positive"
              icon={UserCheck}
              color="orange"
              subtitle="Engaged this week"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <KPICardEnhanced
              title="System Health"
              value="99.9%"
              change="Operational"
              changeType="positive"
              icon={Activity}
              color="emerald"
              subtitle="All systems normal"
            />
          </motion.div>
        </motion.div>

        {/* Charts & Analysis Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PerformanceChart />
        </motion.div>

        {/* Comparison Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ComparisonWidget />
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Modules */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Access</h3>
                  <p className="text-sm text-gray-500">Jump to your favorite tools</p>
                </div>
                <Link href="/settings">
                  <Button variant="ghost" size="sm">Customize</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {modules.map((module, index) => {
                const Icon = module.icon;
                const isHovered = hoveredModule === module.id;
                
                const colorStyles: Record<string, string> = {
                  indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
                  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
                  amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
                  rose: 'from-rose-500 to-pink-600 shadow-rose-500/30',
                  cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/30',
                  violet: 'from-violet-500 to-fuchsia-600 shadow-violet-500/30',
                };

                return (
                  <motion.div
                    key={module.id}
                    variants={itemVariants}
                    onMouseEnter={() => setHoveredModule(module.id)}
                    onMouseLeave={() => setHoveredModule(null)}
                  >
                    <Link href={module.href}>
                      <Card className="h-full group relative overflow-hidden" hover>
                        {/* Animated background gradient */}
                        <motion.div
                          animate={{ opacity: isHovered ? 0.05 : 0 }}
                          className={`absolute inset-0 bg-gradient-to-br ${colorStyles[module.color]}`}
                        />

                        <div className="relative">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <motion.div 
                              animate={{ rotate: isHovered ? 5 : 0, scale: isHovered ? 1.1 : 1 }}
                              className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[module.color]} text-white shadow-lg`}
                            >
                              <Icon className="w-6 h-6" />
                            </motion.div>
                            <div className="flex items-center gap-2">
                              {module.badge && (
                                <Badge variant={module.badge === 'New' ? 'success' : 'info'}>
                                  {module.badge}
                                </Badge>
                              )}
                              <motion.div
                                animate={{ x: isHovered ? 4 : 0 }}
                                className="text-gray-400"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </motion.div>
                            </div>
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                            {module.description}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{module.stats.value}</span>
                            <span className="text-xs text-gray-500">{module.stats.label}</span>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2">
                            {module.features.map((feature) => (
                              <span 
                                key={feature}
                                className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Sidebar - Enhanced with all new widgets */}
          <div className="space-y-6">
            {/* Export Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ExportWidget />
            </motion.div>

            {/* Smart Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SmartInsights />
            </motion.div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Searches */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <RecentSearches />
            </motion.div>

            {/* Real-time Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RealtimeStatus />
            </motion.div>

            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                System Status
              </h3>
              <div className="space-y-4">
                <ProgressBar value={94} max={100} color="emerald" label="Forecast Accuracy" />
                <ProgressBar value={78} max={100} color="indigo" label="Data Completeness" />
                <ProgressBar value={85} max={100} color="amber" label="Inventory Optimization" />
              </div>
            </motion.div>

            {/* Live Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LiveActivity />
            </motion.div>

            {/* Mini Calendar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <MiniCalendar />
            </motion.div>

            {/* Todo List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm"
            >
              <TodoList />
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Achievement Unlocked!</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Forecast Master</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Maintained 90%+ forecast accuracy for 30 days straight!
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
