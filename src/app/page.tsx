'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Upload, FileSpreadsheet, CheckCircle2, Clock, AlertCircle, Sparkles,
  Download, FileText, BarChart3, PieChart, Activity, Brain
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { 
  SpiderWebChart, MultiAxisChart, StackedBarChart, DonutChart,
  AreaRangeChart, HorizontalBarChart 
} from '@/components/dashboard/AdvancedCharts';

// Mock data for charts
const spiderData = [
  { subject: 'Inventory', A: 85, B: 90, C: 70 },
  { subject: 'Sales', A: 75, B: 85, C: 65 },
  { subject: 'Forecast', A: 90, B: 80, C: 75 },
  { subject: 'Service', A: 80, B: 85, C: 70 },
  { subject: 'Cost', A: 70, B: 75, C: 60 },
  { subject: 'Quality', A: 95, B: 90, C: 85 },
];

const lineData = [
  { name: 'Jan', orders: 120, revenue: 45000 },
  { name: 'Feb', orders: 135, revenue: 52000 },
  { name: 'Mar', orders: 148, revenue: 58000 },
  { name: 'Apr', orders: 162, revenue: 64000 },
  { name: 'May', orders: 155, revenue: 61000 },
  { name: 'Jun', orders: 178, revenue: 72000 },
];

const donutData = [
  { name: 'A-Class', value: 156, color: '#10b981' },
  { name: 'B-Class', value: 234, color: '#f59e0b' },
  { name: 'C-Class', value: 390, color: '#64748b' },
];

const stackData = [
  { name: 'Q1', electronics: 45, clothing: 32, home: 28, sports: 15 },
  { name: 'Q2', electronics: 52, clothing: 38, home: 32, sports: 18 },
  { name: 'Q3', electronics: 48, clothing: 42, home: 35, sports: 22 },
  { name: 'Q4', electronics: 62, clothing: 48, home: 40, sports: 28 },
];

const areaData = [
  { name: 'Week 1', stock: 85, threshold: 60 },
  { name: 'Week 2', stock: 72, threshold: 60 },
  { name: 'Week 3', stock: 68, threshold: 60 },
  { name: 'Week 4', stock: 45, threshold: 60 },
  { name: 'Week 5', stock: 55, threshold: 60 },
  { name: 'Week 6', stock: 78, threshold: 60 },
];

const horizontalData = [
  { name: 'Electronics', value: 85, color: '#6366f1' },
  { name: 'Clothing', value: 72, color: '#10b981' },
  { name: 'Home', value: 68, color: '#f59e0b' },
  { name: 'Sports', value: 55, color: '#ef4444' },
  { name: 'Books', value: 42, color: '#8b5cf6' },
];

interface DashboardStats {
  totalOrders: number;
  ordersChange: number;
  revenue: number;
  revenueChange: number;
  customers: number;
  customersChange: number;
  products: number;
  productsChange: number;
}

interface RecentBatch {
  id: string;
  name: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  records: number;
  createdAt: string;
}

const INITIAL_STATS: DashboardStats = {
  totalOrders: 0, ordersChange: 0, revenue: 0, revenueChange: 0,
  customers: 0, customersChange: 0, products: 0, productsChange: 0,
};

function StatCard({ title, value, change, icon: Icon, prefix = '' }: {
  title: string; value: number; change: number; icon: React.ElementType; prefix?: string;
}) {
  const isPositive = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{prefix}{value.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-500/10">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <span className={`flex items-center text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
        <span className="text-slate-500 text-xs">vs last month</span>
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getStatusIcon(status: RecentBatch['status']) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'processing': return <Clock className="w-4 h-4 text-amber-400" />;
    case 'failed': return <AlertCircle className="w-4 h-4 text-rose-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusClass(status: RecentBatch['status']) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'failed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

// Export functions
function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [recentBatches, setRecentBatches] = useState<RecentBatch[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          totalOrders: 1247, ordersChange: 12.5,
          revenue: 84250, revenueChange: 8.2,
          customers: 48, customersChange: 5.3,
          products: 156, productsChange: -2.1,
        });
        setRecentBatches([
          { id: '1', name: 'Q1 Sales Data.xlsx', status: 'completed', records: 234, createdAt: '2 hours ago' },
          { id: '2', name: 'March Orders.csv', status: 'processing', records: 89, createdAt: '4 hours ago' },
          { id: '3', name: 'Customer Export.xlsx', status: 'failed', records: 0, createdAt: '1 day ago' },
          { id: '4', name: 'Inventory Update.xlsx', status: 'pending', records: 456, createdAt: '2 days ago' },
        ]);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (showLogo) {
    return <AnimatedLogo onComplete={() => setShowLogo(false)} />;
  }

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening with your business today</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(recentBatches, 'dashboard-data')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors">
            <Upload className="w-4 h-4" />
            Upload Data
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={stats.totalOrders} change={stats.ordersChange} icon={Package} />
        <StatCard title="Revenue" value={stats.revenue} change={stats.revenueChange} icon={DollarSign} prefix="$" />
        <StatCard title="Customers" value={stats.customers} change={stats.customersChange} icon={Users} />
        <StatCard title="Products" value={stats.products} change={stats.productsChange} icon={TrendingUp} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spider Web Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Performance Radar</h3>
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <SpiderWebChart data={spiderData} />
        </motion.div>

        {/* Multi-Axis Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Orders & Revenue Trend</h3>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <MultiAxisChart data={lineData} />
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">ABC Classification</h3>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <PieChart className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <DonutChart data={donutData} />
        </motion.div>

        {/* Stacked Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Quarterly Category Performance</h3>
            <div className="p-2 rounded-lg bg-violet-500/10">
              <BarChart3 className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <StackedBarChart data={stackData} />
        </motion.div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Stock Level Monitoring</h3>
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Activity className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <AreaRangeChart data={areaData} />
        </motion.div>

        {/* Horizontal Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Category Performance</h3>
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <HorizontalBarChart data={horizontalData} />
        </motion.div>
      </div>

      {/* Recent Uploads & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <h2 className="font-semibold text-white">Recent Uploads</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToJSON(recentBatches, 'uploads')}
                className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-500/10"
              >
                Export JSON
              </button>
              <Link href="/upload" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-white/6">
            {recentBatches.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No uploads yet</p>
                <Link href="/upload" className="inline-flex items-center gap-1.5 mt-2 text-xs text-indigo-400 hover:text-indigo-300">
                  Upload your first file
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              recentBatches.map((batch) => (
                <div key={batch.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{batch.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{batch.records} records • {batch.createdAt}</p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", getStatusClass(batch.status))}>
                    {getStatusIcon(batch.status)}
                    <span className="capitalize">{batch.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Ask questions about your data, get insights, and generate reports using natural language.
                </p>
                <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                  Chat with AI
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'ABC Analysis', href: '/abc-dashboard', icon: PieChart },
                { label: 'Forecasting', href: '/forecasting', icon: TrendingUp },
                { label: 'Order Optimizer', href: '/optimizer', icon: Package },
                { label: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  <link.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
