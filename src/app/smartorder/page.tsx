'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Upload, Package, CheckCircle, Clock, AlertTriangle,
  TrendingUp, ArrowRight, RefreshCw, Sparkles, Zap,
  FileText, Users, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { SmartOrderBatch, SmartAnalyticsSnapshot } from '@/lib/smart-order/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SmartOrderDashboard() {
  const [batches, setBatches] = useState<SmartOrderBatch[]>([]);
  const [analytics, setAnalytics] = useState<SmartAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [batchesRes, analyticsRes] = await Promise.all([
        fetch('/api/batches?limit=5'),
        fetch('/api/analytics')
      ]);
      
      if (!batchesRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const batchesData = await batchesRes.json();
      const analyticsData = await analyticsRes.json();
      
      setBatches(batchesData.batches || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalOrders: analytics?.kpis?.ordersCreated || 0,
    successRate: Math.round((analytics?.kpis?.successRate || 0) * 100),
    pendingBatches: batches.filter(b => ['UPLOADED', 'VALIDATING', 'VALIDATED', 'PROCESSING'].includes(b.status)).length,
    todayOrders: batches.filter(b => {
      const created = new Date(b.createdAt);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).reduce((sum, b) => sum + b.successCount, 0),
  };

  const statCards = [
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: Package, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Success Rate', 
      value: `${stats.successRate}%`, 
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Pending Batches', 
      value: stats.pendingBatches.toString(), 
      icon: Clock, 
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      trend: '0',
      trendUp: null
    },
    { 
      title: 'Today\'s Orders', 
      value: stats.todayOrders.toString(), 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      trend: '+8',
      trendUp: true
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-800 border-green-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
      'PARTIAL_SUCCESS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'UPLOADED': 'bg-gray-100 text-gray-800 border-gray-200',
      'VALIDATED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e89a2d]/10 to-orange-500/10 rounded-3xl" />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl shadow-orange-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#e89a2d]" />
                <span className="text-sm font-medium text-[#e89a2d]">Welcome back</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">SmartOrder Dashboard</h1>
              <p className="text-gray-500 mt-2 max-w-xl">
                AI-Driven Order Creation. Upload Excel files, let AI map the columns, and create SAP orders automatically.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/smartorder/upload"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e89a2d] to-orange-600 text-white rounded-2xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Orders
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div 
          variants={itemVariants}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.trendUp !== null && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-[#1a1a2e] mt-1">
                  {loading ? '-' : stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { 
                  href: '/smartorder/upload', 
                  icon: Upload, 
                  title: 'Upload Orders', 
                  desc: 'Excel/CSV files',
                  color: 'from-orange-500 to-amber-500',
                  shadow: 'shadow-orange-500/20'
                },
                { 
                  href: '/smartorder/orders', 
                  icon: Package, 
                  title: 'View Orders', 
                  desc: 'History & status',
                  color: 'from-blue-500 to-cyan-500',
                  shadow: 'shadow-blue-500/20'
                },
                { 
                  href: '/smartorder/analytics', 
                  icon: BarChart3, 
                  title: 'Analytics', 
                  desc: 'Reports & insights',
                  color: 'from-purple-500 to-pink-500',
                  shadow: 'shadow-purple-500/20'
                },
              ].map((action, index) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    className="group relative p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all duration-300"
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-[#1a1a2e]">{action.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                    <ArrowRight className="w-5 h-5 text-gray-400 mt-4 group-hover:text-[#e89a2d] group-hover:translate-x-1 transition-all" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Orders Trend */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1a1a2e]">Orders Trend</h3>
                <p className="text-sm text-gray-500">Last 30 days performance</p>
              </div>
              <select className="text-sm border rounded-xl px-3 py-2 bg-gray-50">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : analytics?.ordersOverTime?.length ? (
              <div className="h-64 flex items-end gap-2">
                {analytics.ordersOverTime.slice(-7).map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex-1 flex flex-col items-center gap-2"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{ originY: 1 }}
                  >
                    <div 
                      className="w-full bg-gradient-to-t from-[#e89a2d] to-orange-400 rounded-t-lg transition-all hover:from-orange-600 hover:to-orange-500"
                      style={{ height: `${(item.count / Math.max(...analytics.ordersOverTime.slice(-7).map(i => i.count))) * 200}px` }}
                    />
                    <span className="text-xs text-gray-500">{item.period.slice(-2)}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No data available yet</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Recent Batches */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Recent Batches</h3>
              <Link 
                href="/smartorder/orders"
                className="text-sm text-[#e89a2d] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No batches yet</p>
                  <Link 
                    href="/smartorder/upload"
                    className="inline-flex items-center gap-2 mt-3 text-[#e89a2d] text-sm font-medium hover:underline"
                  >
                    <Zap className="w-4 h-4" />
                    Upload your first batch
                  </Link>
                </div>
              ) : (
                batches.slice(0, 5).map((batch, index) => (
                  <motion.div 
                    key={batch.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        batch.status === 'COMPLETED' ? 'bg-green-100' :
                        batch.status === 'FAILED' ? 'bg-red-100' :
                        batch.status === 'PROCESSING' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {batch.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                         batch.status === 'FAILED' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                         batch.status === 'PROCESSING' ? <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" /> :
                         <FileText className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#1a1a2e]">{batch.batchName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {batch.successCount}/{batch.totalOrders}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-gray-800 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#e89a2d]" />
              <h3 className="font-semibold">Pro Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#e89a2d] rounded-full mt-2" />
                Use the Excel template for faster uploads
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#e89a2d] rounded-full mt-2" />
                AI mapping works best with standard headers
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-[#e89a2d] rounded-full mt-2" />
                Validate before processing to avoid errors
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
