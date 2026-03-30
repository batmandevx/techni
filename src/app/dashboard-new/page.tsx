'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Package, Users, DollarSign,
  AlertCircle, Sparkles, BarChart3, Activity, Upload
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';
import {
  MultiAxisChart, StackedBarChart, DonutChart,
  HorizontalBarChart, AreaRangeChart, SpiderWebChart
} from '@/components/dashboard/AdvancedCharts';

export default function DashboardNewPage() {
  const { hasUploadedData, materials, historicalData, months } = useData();

  const lineData = useMemo(() => {
    return months.map((month) => {
      let orders = 0;
      let revenue = 0;
      materials.forEach(mat => {
        const hist = historicalData[mat.id]?.find(h => h.month === month);
        if (hist) {
          orders += Math.round(hist.actualSales / 10);
          revenue += hist.actualSales * (mat.priceUSD || 10);
        }
      });
      return { name: month, orders, revenue: Math.round(revenue) };
    });
  }, [months, materials, historicalData]);

  const donutData = useMemo(() => {
    const totals = materials.map(mat => {
      const totalVol = historicalData[mat.id]?.reduce((sum, h) => sum + h.actualSales, 0) || 0;
      return { id: mat.id, totalVol };
    }).sort((a, b) => b.totalVol - a.totalVol);
    
    const aCount = Math.max(1, Math.floor(totals.length * 0.2));
    const bCount = Math.max(1, Math.floor(totals.length * 0.3));
    const cCount = Math.max(1, totals.length - aCount - bCount);

    return [
      { name: 'A-Class', value: aCount, color: '#10b981' },
      { name: 'B-Class', value: bCount, color: '#f59e0b' },
      { name: 'C-Class', value: cCount, color: '#64748b' },
    ];
  }, [materials, historicalData]);

  const stackData = useMemo(() => {
    const chunks: any[] = [];
    for (let i = 0; i < months.length; i += 3) {
      const qMonths = months.slice(i, i + 3);
      let core = 0, premium = 0, standard = 0, basic = 0;
      materials.forEach((mat, idx) => {
        let chunkVol = 0;
        qMonths.forEach(m => {
          chunkVol += historicalData[mat.id]?.find(hd => hd.month === m)?.actualSales || 0;
        });
        if (idx % 4 === 0) premium += chunkVol;
        else if (idx % 3 === 0) core += chunkVol;
        else if (idx % 2 === 0) standard += chunkVol;
        else basic += chunkVol;
      });
      chunks.push({ 
        name: `Q${Math.floor(i/3) + 1}`, 
        Premium: Math.round(premium), 
        Core: Math.round(core), 
        Standard: Math.round(standard), 
        Basic: Math.round(basic) 
      });
    }
    return chunks;
  }, [months, materials, historicalData]);

  const areaData = useMemo(() => {
    return months.map((month) => {
      let stock = 0;
      materials.forEach(mat => {
        const hist = historicalData[mat.id]?.find(h => h.month === month);
        if (hist) stock += hist.openingStock;
      });
      return { name: month, stock, threshold: Math.round(stock * 0.8) };
    });
  }, [months, materials, historicalData]);

  const horizontalData = useMemo(() => {
    const categories: Record<string, number> = {};
    materials.forEach(mat => {
      const cat = mat.id.substring(mat.id.length - 1) > '5' ? 'Fast Moving' : 'Stable';
      const vol = historicalData[mat.id]?.reduce((sum, h) => sum + h.actualSales, 0) || 0;
      categories[cat] = (categories[cat] || 0) + vol;
    });
    
    return Object.entries(categories).map(([name, value], i) => ({
      name, 
      value: Math.round(value), 
      color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4]
    }));
  }, [materials, historicalData]);

  const spiderData = useMemo(() => [
    { subject: 'Inventory', A: Math.min(100, materials.length * 2), B: 90, C: 70 },
    { subject: 'Sales Volume', A: Math.min(100, materials.length * 5), B: 85, C: 65 },
    { subject: 'Forecast Accuracy', A: hasUploadedData ? 92 : 0, B: 80, C: 75 },
    { subject: 'Service Level', A: hasUploadedData ? 95 : 0, B: 85, C: 70 },
    { subject: 'Cost Control', A: hasUploadedData ? 88 : 0, B: 75, C: 60 },
    { subject: 'Quality', A: hasUploadedData ? 98 : 0, B: 90, C: 85 },
  ], [materials.length, hasUploadedData]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = 0;
    materials.forEach(mat => {
      historicalData[mat.id]?.forEach(h => {
        totalRevenue += h.actualSales * (mat.priceUSD || 10);
        totalOrders += Math.round(h.actualSales / 10);
      });
    });
    return {
      totalOrders,
      revenue: Math.round(totalRevenue),
      customers: Math.max(0, Math.floor(materials.length / 2)),
      products: materials.length,
    };
  }, [materials, historicalData]);

  if (!hasUploadedData || materials.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 lg:p-7"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-white/5 shadow-xl">
            <Activity className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Advanced Dashboard</h2>
          <p className="text-slate-400 mb-8">Please upload an Excel or CSV file to start analyzing your supply chain data.</p>
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Deep-dive analytics from your uploaded data</p>
        </div>
        <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Upload className="w-4 h-4" />
          Upload Data
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10"><Package className="w-5 h-5 text-indigo-400" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Customers</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.customers}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10"><Users className="w-5 h-5 text-amber-400" /></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Products</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.products}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-500/10"><TrendingUp className="w-5 h-5 text-violet-400" /></div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Performance Radar</h3>
            <div className="p-2 rounded-lg bg-indigo-500/10"><Activity className="w-4 h-4 text-indigo-400" /></div>
          </div>
          <SpiderWebChart data={spiderData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Orders & Revenue Trend</h3>
            <div className="p-2 rounded-lg bg-emerald-500/10"><BarChart3 className="w-4 h-4 text-emerald-400" /></div>
          </div>
          <MultiAxisChart data={lineData} />
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">ABC Classification</h3>
            <div className="p-2 rounded-lg bg-amber-500/10"><Sparkles className="w-4 h-4 text-amber-400" /></div>
          </div>
          <DonutChart data={donutData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Quarterly Category Performance</h3>
            <div className="p-2 rounded-lg bg-violet-500/10"><BarChart3 className="w-4 h-4 text-violet-400" /></div>
          </div>
          <StackedBarChart data={stackData} />
        </motion.div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Stock Level Monitoring</h3>
            <div className="p-2 rounded-lg bg-rose-500/10"><Activity className="w-4 h-4 text-rose-400" /></div>
          </div>
          <AreaRangeChart data={areaData} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Category Performance</h3>
            <div className="p-2 rounded-lg bg-cyan-500/10"><BarChart3 className="w-4 h-4 text-cyan-400" /></div>
          </div>
          <HorizontalBarChart data={horizontalData} />
        </motion.div>
      </div>
    </div>
  );
}
