'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  X, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

interface SearchHistory {
  id: string;
  query: string;
  type: 'sku' | 'report' | 'analysis' | 'page';
  timestamp: Date;
  result?: string;
}

const defaultSearches: SearchHistory[] = [
  { id: '1', query: 'ABC Analysis Q1', type: 'report', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', query: 'SKU-A1234', type: 'sku', timestamp: new Date(Date.now() - 7200000) },
  { id: '3', query: 'Low stock items', type: 'analysis', timestamp: new Date(Date.now() - 86400000) },
  { id: '4', query: 'Forecast accuracy', type: 'page', timestamp: new Date(Date.now() - 172800000) },
];

const typeIcons = {
  sku: Search,
  report: TrendingUp,
  analysis: TrendingUp,
  page: ArrowUpRight,
};

const typeColors = {
  sku: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  report: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
  analysis: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  page: 'text-gray-500 bg-gray-100 dark:bg-slate-700',
};

export function RecentSearches() {
  const [searches, setSearches] = useState<SearchHistory[]>(defaultSearches);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tenchi-search-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSearches(parsed.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })));
      } catch (e) {}
    }
  }, []);

  const saveSearches = (newSearches: SearchHistory[]) => {
    setSearches(newSearches);
    localStorage.setItem('tenchi-search-history', JSON.stringify(newSearches));
  };

  const removeSearch = (id: string) => {
    saveSearches(searches.filter(s => s.id !== id));
  };

  const clearAll = () => {
    saveSearches([]);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const displaySearches = isExpanded ? searches : searches.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent</h3>
        </div>
        {searches.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Searches List */}
      <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
        <AnimatePresence mode="popLayout">
          {displaySearches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center text-gray-400"
            >
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No recent searches</p>
            </motion.div>
          ) : (
            displaySearches.map((search, index) => {
              const Icon = typeIcons[search.type];
              const colorClass = typeColors[search.type];

              return (
                <motion.div
                  key={search.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className={`p-1.5 rounded-lg ${colorClass}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {search.query}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(search.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSearch(search.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Show More/Less */}
      {searches.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium border-t border-gray-100 dark:border-slate-700 transition-colors"
        >
          {isExpanded ? 'Show less' : `Show ${searches.length - 3} more`}
        </button>
      )}
    </div>
  );
}
