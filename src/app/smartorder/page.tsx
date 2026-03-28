'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, 
  TrendingUp, Package, Users, DollarSign, ArrowUpRight, ArrowDownRight,
  Download, Sparkles, Brain, BarChart3
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface Batch {
  id: string;
  batchName: string;
  fileName: string;
  status: string;
  totalOrders: number;
  successCount: number;
  failedCount: number;
  aiMappingConfidence: number | null;
  createdAt: string;
  _count: { orderLines: number };
}

interface Analytics {
  kpis: {
    totalOrders: number;
    completedOrders: number;
    failedOrders: number;
    successRate: string;
    totalValue: number;
    uniqueCustomers: number;
    uniqueMaterials: number;
  };
  dailyTrend: Array<{
    date: string;
    orders: number;
    value: number;
  }>;
  topCustomers: Array<{
    customerNumber: string;
    customerName: string;
    orderCount: number;
    totalValue: number;
  }>;
}

function StatCard({ title, value, change, icon: Icon, prefix = '' }: {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ElementType;
  prefix?: string;
}) {
  const isPositive = change && !change.startsWith('-');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-500/10">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-3">
          <span className={`flex items-center text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-slate-500 text-xs">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'PROCESSING': return <Clock className="w-4 h-4 text-amber-400" />;
    case 'FAILED': return <AlertCircle className="w-4 h-4 text-rose-400" />;
    case 'PARTIAL_SUCCESS': return <AlertCircle className="w-4 h-4 text-amber-400" />;
    default: return <Clock className="w-4 h-4 text-slate-400" />;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PROCESSING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'PARTIAL_SUCCESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export default function SmartOrderDashboard() {
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [batchesRes, analyticsRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/analytics?days=30'),
      ]);

      if (batchesRes.ok) {
        const batchesData = await batchesRes.json();
        setBatches(batchesData.batches || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportBatch(batchId: string, format: 'xlsx' | 'csv') {
    try {
      const response = await fetch(`/api/batches/${batchId}/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch-${batchId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading SmartOrder..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">SmartOrder Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-powered order automation and SAP integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/smartorder/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Orders
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Orders" 
            value={analytics.kpis.totalOrders} 
            change="+12.5%"
            icon={Package} 
          />
          <StatCard 
            title="Order Value" 
            value={analytics.kpis.totalValue} 
            prefix="$"
            change="+8.2%"
            icon={DollarSign} 
          />
          <StatCard 
            title="Success Rate" 
            value={`${analytics.kpis.successRate}%`}
            icon={CheckCircle2} 
          />
          <StatCard 
            title="Unique Customers" 
            value={analytics.kpis.uniqueCustomers}
            change="+5.3%"
            icon={Users} 
          />
        </div>
      )}

      {/* Recent Batches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <h2 className="font-semibold text-white">Recent Uploads</h2>
          <div className="flex items-center gap-2">
            <Link 
              href="/smartorder/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-white/6">
          {batches.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No uploads yet</p>
              <Link
                href="/smartorder/upload"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload your first file
              </Link>
            </div>
          ) : (
            batches.slice(0, 5).map((batch) => (
              <div
                key={batch.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/10">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {batch.batchName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {batch.totalOrders} orders • AI confidence: {((batch.aiMappingConfidence || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(batch.status)}`}>
                    {getStatusIcon(batch.status)}
                    <span className="capitalize">{batch.status.replace('_', ' ')}</span>
                  </div>
                  <button
                    onClick={() => exportBatch(batch.id, 'xlsx')}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Download Excel"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Analytics Section */}
      {analytics && analytics.topCustomers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Top Customers</h3>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="space-y-3">
              {analytics.topCustomers.slice(0, 5).map((customer, i) => (
                <div key={customer.customerNumber} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-medium text-indigo-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{customer.customerName}</p>
                    <p className="text-xs text-slate-500">{customer.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-400">${customer.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <Brain className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Column Mapping</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Our AI automatically detects and maps Excel columns to SAP fields with 90%+ accuracy.
                  </p>
                  <Link href="/smartorder/upload" className="inline-flex items-center gap-1.5 mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                    Try it now
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">SAP Integration</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Direct BAPI integration for real-time order creation in SAP S/4HANA.
                  </p>
                  <Link href="/smartorder/orders" className="inline-flex items-center gap-1.5 mt-3 text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                    View Orders
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
