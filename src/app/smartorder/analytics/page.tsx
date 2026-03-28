'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Package, CheckCircle, AlertTriangle,
  Download, Calendar, ArrowLeft, RefreshCw, BarChart3,
  Users, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { SmartAnalyticsSnapshot } from '@/lib/smart-order/types';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<SmartAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - parseInt(dateRange));
      
      const response = await fetch(
        `/api/analytics?dateFrom=${fromDate.toISOString().split('T')[0]}&dateTo=${new Date().toISOString().split('T')[0]}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { 
      title: 'Orders Created', 
      value: analytics?.kpis?.ordersCreated || 0, 
      change: analytics?.kpis?.ordersCreatedChange || 0,
      icon: Package, 
      color: 'from-blue-500 to-cyan-500',
      trend: analytics?.kpis?.ordersCreatedChange || 0
    },
    { 
      title: 'Success Rate', 
      value: `${Math.round((analytics?.kpis?.successRate || 0) * 100)}%`, 
      change: 0,
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-500',
      trend: 5
    },
    { 
      title: 'SKU Mix', 
      value: analytics?.kpis?.skuMix || 0, 
      change: 0,
      icon: Package, 
      color: 'from-purple-500 to-pink-500',
      trend: 12
    },
    { 
      title: 'Fill Rate', 
      value: `${Math.round((analytics?.kpis?.fillRate || 0) * 100)}%`, 
      change: 0,
      icon: TrendingUp, 
      color: 'from-orange-500 to-amber-500',
      trend: 3
    },
  ];

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/smartorder" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Order processing insights and KPIs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAnalytics}
            className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e89a2d] focus:border-transparent bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-2 font-medium">
            <Download className="w-5 h-5" />
            Export
          </button>
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

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
              {kpi.trend !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{kpi.title}</p>
              <p className={`text-3xl font-bold mt-1 ${
                kpi.color.includes('blue') ? 'text-blue-600' :
                kpi.color.includes('green') ? 'text-green-600' :
                kpi.color.includes('purple') ? 'text-purple-600' :
                'text-orange-600'
              }`}>
                {loading ? '-' : kpi.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Orders Over Time</h3>
              <p className="text-sm text-gray-500">Daily order volume</p>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : analytics?.ordersOverTime?.length ? (
            <div className="h-64 flex items-end gap-2">
              {analytics.ordersOverTime.map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ originY: 1 }}
                >
                  <div className="w-full flex gap-1">
                    <motion.div 
                      className="flex-1 bg-gradient-to-t from-[#e89a2d] to-orange-400 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.count / Math.max(...analytics.ordersOverTime.map(i => i.count))) * 150}px` }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full text-center">{item.period.slice(-5)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Value by Customer */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Top Customers by Value</h3>
              <p className="text-sm text-gray-500">Revenue by customer</p>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : analytics?.orderValueByCustomer?.length ? (
            <div className="h-64 space-y-4">
              {analytics.orderValueByCustomer.slice(0, 5).map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-semibold text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#1a1a2e]">{item.customer}</span>
                      <span className="text-sm text-gray-500">${item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-[#e89a2d] to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / Math.max(...analytics.orderValueByCustomer.map(i => i.value))) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* SKU Distribution */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a2e]">SKU Distribution</h3>
              <p className="text-sm text-gray-500">Orders by material category</p>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : analytics?.skuDistribution?.length ? (
            <div className="h-64 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  {analytics.skuDistribution.map((item, index) => {
                    const total = analytics.skuDistribution.reduce((sum, i) => sum + i.value, 0);
                    const percentage = (item.value / total) * 100;
                    const colors = ['#e89a2d', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div
                        key={index}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(${color} 0% ${percentage}%, transparent ${percentage}% 100%)`,
                          transform: `rotate(${index * (360 / analytics.skuDistribution.length)}deg)`
                        }}
                      />
                    );
                  })}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#1a1a2e]">{analytics.kpis?.skuMix || 0}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {analytics.skuDistribution.map((item, index) => {
                  const colors = ['#e89a2d', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm flex-1">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No data available</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Batches */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Recent Batches</h3>
              <p className="text-sm text-gray-500">Latest order batches</p>
            </div>
            <Link 
              href="/smartorder/orders"
              className="text-sm text-[#e89a2d] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
              </div>
            ) : analytics?.recentBatches?.length ? (
              analytics.recentBatches.slice(0, 5).map((batch, index) => (
                <motion.div 
                  key={batch.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
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
                       <Package className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#1a1a2e]">{batch.batchName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      batch.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {batch.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {batch.successCount}/{batch.totalOrders}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent batches</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
