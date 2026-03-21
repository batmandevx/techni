'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface SystemStatus {
  database: 'connected' | 'syncing' | 'error';
  api: 'online' | 'degraded' | 'offline';
  realtime: boolean;
  lastSync: Date;
  pendingUpdates: number;
}

export function RealtimeStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    database: 'connected',
    api: 'online',
    realtime: true,
    lastSync: new Date(),
    pendingUpdates: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingUpdates: Math.floor(Math.random() * 3), // Random pending updates
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSync = () => {
    setStatus(prev => ({ ...prev, database: 'syncing' }));
    setTimeout(() => {
      setStatus(prev => ({ 
        ...prev, 
        database: 'connected',
        pendingUpdates: 0,
        lastSync: new Date()
      }));
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return 'text-emerald-500';
      case 'syncing':
        return 'text-amber-500';
      case 'error':
      case 'offline':
        return 'text-rose-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return 'bg-emerald-500/10';
      case 'syncing':
        return 'bg-amber-500/10';
      case 'error':
      case 'offline':
        return 'bg-rose-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${getStatusBg(status.api)} ${getStatusColor(status.api)}`}>
            {status.realtime ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Real-time Connection</h3>
            <p className="text-xs text-gray-500">
              {status.realtime ? 'Live data updates enabled' : 'Offline mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status.pendingUpdates > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full animate-pulse">
              {status.pendingUpdates} pending
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-slate-700"
          >
            <div className="p-4 space-y-3">
              {/* Database Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Database</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${getStatusColor(status.database)}`}>
                  {status.database === 'syncing' && (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  )}
                  {status.database === 'connected' && <CheckCircle2 className="w-3 h-3" />}
                  {status.database === 'error' && <AlertCircle className="w-3 h-3" />}
                  {status.database.charAt(0).toUpperCase() + status.database.slice(1)}
                </div>
              </div>

              {/* API Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">API Status</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${getStatusColor(status.api)}`}>
                  <div className={`w-2 h-2 rounded-full ${status.api === 'online' ? 'bg-emerald-500' : status.api === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  {status.api.charAt(0).toUpperCase() + status.api.slice(1)}
                </div>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-slate-400">Last Sync</span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {status.lastSync.toLocaleTimeString()}
                </span>
              </div>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={status.database === 'syncing'}
                className="w-full mt-2 py-2 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${status.database === 'syncing' ? 'animate-spin' : ''}`} />
                {status.database === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Pulse */}
      {status.realtime && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
      )}
    </div>
  );
}
