'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Mail,
  RefreshCw,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'inventory' | 'forecast' | 'alert' | 'success' | 'report' | 'email' | 'refresh' | 'user';
  message: string;
  detail?: string;
  time: Date;
  read: boolean;
}

const initialActivities: Activity[] = [
  { id: '1', type: 'forecast', message: 'Forecast updated', detail: 'M-1 accuracy: 84.5%', time: new Date(Date.now() - 2 * 60000), read: false },
  { id: '2', type: 'inventory', message: 'ABC Analysis complete', detail: '234 SKUs analyzed', time: new Date(Date.now() - 15 * 60000), read: false },
  { id: '3', type: 'success', message: 'Data export successful', detail: 'Excel file generated', time: new Date(Date.now() - 45 * 60000), read: true },
  { id: '4', type: 'alert', message: 'Low stock alert', detail: '5 SKUs need attention', time: new Date(Date.now() - 60 * 60000), read: true },
  { id: '5', type: 'report', message: 'Monthly report ready', detail: 'Review pending', time: new Date(Date.now() - 120 * 60000), read: true },
];

const activityIcons = {
  inventory: Package,
  forecast: TrendingUp,
  alert: AlertTriangle,
  success: CheckCircle,
  report: FileText,
  email: Mail,
  refresh: RefreshCw,
  user: User,
};

const activityColors = {
  inventory: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
  forecast: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
  alert: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
  success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
  report: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
  email: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400',
  refresh: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400',
  user: 'text-gray-600 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400',
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function LiveActivity() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Simulate new activity
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      const randomActivities = [
        { type: 'inventory' as const, message: 'Stock levels updated', detail: `${Math.floor(Math.random() * 20 + 5)} items processed` },
        { type: 'success' as const, message: 'Sync completed', detail: 'All systems up to date' },
        { type: 'report' as const, message: 'Report generated', detail: 'PDF ready for download' },
      ];
      
      if (Math.random() > 0.7) {
        const random = randomActivities[Math.floor(Math.random() * randomActivities.length)];
        const newActivity: Activity = {
          id: Date.now().toString(),
          ...random,
          time: new Date(),
          read: false,
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 6)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const markAllRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, read: true })));
  };

  const unreadCount = activities.filter(a => !a.read).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">Live Activity</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
              isAutoRefresh 
                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' 
                : 'text-gray-500 bg-gray-100 dark:bg-slate-700'
            }`}
          >
            {isAutoRefresh ? 'Live' : 'Paused'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                  !activity.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${activityColors[activity.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {activity.message}
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(activity.time)}
                      </span>
                    </div>
                    {activity.detail && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                        {activity.detail}
                      </p>
                    )}
                  </div>
                  {!activity.read && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
