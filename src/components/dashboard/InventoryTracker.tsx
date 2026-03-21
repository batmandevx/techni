'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  maxStock: number;
  reorderPoint: number;
  status: 'good' | 'low' | 'critical' | 'excess';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  category: string;
  warehouse: string;
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Wireless Headphones Pro', sku: 'WH-001', stock: 245, maxStock: 500, reorderPoint: 100, status: 'good', lastUpdated: '2 min ago', trend: 'down', trendValue: -5, category: 'Electronics', warehouse: 'WH-A' },
  { id: '2', name: 'USB-C Cable 2m', sku: 'UC-203', stock: 45, maxStock: 300, reorderPoint: 50, status: 'low', lastUpdated: '5 min ago', trend: 'down', trendValue: -12, category: 'Accessories', warehouse: 'WH-B' },
  { id: '3', name: 'Laptop Stand Aluminum', sku: 'LS-105', stock: 8, maxStock: 150, reorderPoint: 20, status: 'critical', lastUpdated: '1 min ago', trend: 'down', trendValue: -25, category: 'Accessories', warehouse: 'WH-A' },
  { id: '4', name: 'Mechanical Keyboard RGB', sku: 'KB-400', stock: 890, maxStock: 400, reorderPoint: 80, status: 'excess', lastUpdated: '10 min ago', trend: 'up', trendValue: 45, category: 'Electronics', warehouse: 'WH-C' },
  { id: '5', name: 'Mouse Pad XL', sku: 'MP-120', stock: 156, maxStock: 400, reorderPoint: 60, status: 'good', lastUpdated: '15 min ago', trend: 'stable', trendValue: 0, category: 'Accessories', warehouse: 'WH-A' },
];

const statusConfig = {
  good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, label: 'Good' },
  low: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, label: 'Low Stock' },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: AlertTriangle, label: 'Critical' },
  excess: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Package, label: 'Excess' },
};

export function InventoryTracker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStockPercentage = (stock: number, maxStock: number) => {
    return Math.min((stock / maxStock) * 100, 100);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Live Inventory Tracker
          </h3>
          <p className="text-sm text-gray-400 mt-1">Real-time stock levels across all warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={`p-2 rounded-xl hover:bg-slate-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total SKUs', value: '1,247', change: '+12', color: 'text-indigo-400' },
          { label: 'Low Stock', value: '23', change: '-5', color: 'text-amber-400' },
          { label: 'Critical', value: '4', change: '+1', color: 'text-rose-400' },
          { label: 'In Transit', value: '156', change: '+23', color: 'text-emerald-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-1">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search products or SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="all">All Status</option>
          <option value="good">Good</option>
          <option value="low">Low Stock</option>
          <option value="critical">Critical</option>
          <option value="excess">Excess</option>
        </select>
      </div>

      {/* Inventory List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {filteredInventory.map((item, index) => {
            const status = statusConfig[item.status];
            const StatusIcon = status.icon;
            const stockPercentage = getStockPercentage(item.stock, item.maxStock);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-4 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Product Info */}
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{item.sku}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{item.warehouse}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stock Info */}
                  <div className="flex items-center gap-6">
                    {/* Trend */}
                    <div className="text-right">
                      {item.trend === 'up' ? (
                        <div className="flex items-center gap-1 text-emerald-400">
                          <ArrowUpRight className="w-3 h-3" />
                          <span className="text-xs font-medium">+{item.trendValue}%</span>
                        </div>
                      ) : item.trend === 'down' ? (
                        <div className="flex items-center gap-1 text-rose-400">
                          <ArrowDownRight className="w-3 h-3" />
                          <span className="text-xs font-medium">{item.trendValue}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{item.lastUpdated}</p>
                    </div>

                    {/* Stock Count */}
                    <div className="text-right w-20">
                      <p className={`text-lg font-bold ${status.color}`}>{item.stock}</p>
                      <p className="text-xs text-gray-500">/ {item.maxStock}</p>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border ${status.border}`}>
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPercentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        item.status === 'critical' ? 'bg-rose-500' :
                        item.status === 'low' ? 'bg-amber-500' :
                        item.status === 'excess' ? 'bg-blue-500' :
                        'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <button className="w-full py-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          View All Inventory →
        </button>
      </div>
    </div>
  );
}
