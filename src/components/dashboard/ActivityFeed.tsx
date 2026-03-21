'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  User,
  RefreshCw,
  Clock,
  MoreHorizontal,
  Filter
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'order' | 'inventory' | 'shipment' | 'alert' | 'success' | 'user';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  metadata?: any;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'order', title: 'New Order Received', description: 'Order #ORD-7829 for $12,450', timestamp: '2 min ago', user: 'John Doe' },
  { id: '2', type: 'inventory', title: 'Stock Updated', description: 'Laptop Stand Aluminum - 50 units added', timestamp: '5 min ago' },
  { id: '3', type: 'alert', title: 'Low Stock Alert', description: 'USB-C Cable 2m below reorder point', timestamp: '12 min ago' },
  { id: '4', type: 'shipment', title: 'Shipment Delivered', description: 'Tracking #TRK-99231 arrived at destination', timestamp: '15 min ago' },
  { id: '5', type: 'success', title: 'Forecast Updated', description: 'Q4 demand forecast accuracy: 94.5%', timestamp: '32 min ago' },
  { id: '6', type: 'user', title: 'New User Added', description: 'Sarah Smith joined as Inventory Manager', timestamp: '1 hour ago' },
  { id: '7', type: 'order', title: 'Order Shipped', description: 'Order #ORD-7825 shipped via FedEx', timestamp: '2 hours ago' },
  { id: '8', type: 'inventory', title: 'Inventory Adjusted', description: 'Wireless Headphones: -12 (damaged)', timestamp: '3 hours ago' },
];

const typeConfig = {
  order: { icon: ShoppingCart, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  inventory: { icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  shipment: { icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  alert: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  user: { icon: User, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
};

export function ActivityFeed() {
  const [filter, setFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const filteredActivities = mockActivities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const displayedActivities = expanded ? filteredActivities : filteredActivities.slice(0, 5);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getRelativeTime = (timestamp: string) => {
    return timestamp;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Activity Feed
          </h3>
          <p className="text-sm text-gray-400 mt-1">Real-time updates from your supply chain</p>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All', count: mockActivities.length },
          { key: 'order', label: 'Orders', count: mockActivities.filter(a => a.type === 'order').length },
          { key: 'inventory', label: 'Inventory', count: mockActivities.filter(a => a.type === 'inventory').length },
          { key: 'alert', label: 'Alerts', count: mockActivities.filter(a => a.type === 'alert').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${filter === tab.key 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {displayedActivities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
              >
                {/* Icon */}
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${config.bg} ${config.color} border ${config.border}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-0.5">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>

                  {activity.user && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-xs text-gray-500">{activity.user}</span>
                    </div>
                  )}
                </div>

                {/* Hover Action */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show More/Less */}
      {filteredActivities.length > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center justify-center gap-2"
          >
            {expanded ? 'Show Less' : `Show ${filteredActivities.length - 5} More Activities`}
          </button>
        </div>
      )}
    </div>
  );
}
