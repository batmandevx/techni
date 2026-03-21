'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Zap,
  Package,
  DollarSign,
  BarChart3,
  X
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'action';
  title: string;
  description: string;
  impact: string;
  action: string;
  icon: any;
}

const insights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Stock Optimization Opportunity',
    description: 'SKU-A1234 has 3.2x average coverage. Consider reducing safety stock to free up $12,400.',
    impact: '+$12,400 working capital',
    action: 'Review Safety Stock',
    icon: DollarSign,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Stock Alert',
    description: '5 SKUs in Class A have less than 2 weeks coverage. Risk of stockout is high.',
    impact: 'Potential revenue loss',
    action: 'Place Orders Now',
    icon: AlertTriangle,
  },
  {
    id: '3',
    type: 'success',
    title: 'Forecast Accuracy Improved',
    description: 'Your M-1 forecast accuracy increased to 94.2%, up 3.5% from last month.',
    impact: 'Better planning decisions',
    action: 'View Details',
    icon: TrendingUp,
  },
  {
    id: '4',
    type: 'action',
    title: 'ABC Analysis Ready',
    description: 'New sales data suggests 3 SKUs should be reclassified. Review recommended.',
    impact: 'Optimize inventory mix',
    action: 'Run Analysis',
    icon: BarChart3,
  },
  {
    id: '5',
    type: 'opportunity',
    title: 'Bulk Order Discount',
    description: 'Supplier offering 8% discount for orders above $50k. Current projected: $48k.',
    impact: 'Save $3,840',
    action: 'Adjust Orders',
    icon: Package,
  },
];

const typeConfig = {
  opportunity: { 
    color: 'emerald', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    icon: Lightbulb 
  },
  warning: { 
    color: 'amber', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20',
    icon: AlertTriangle 
  },
  success: { 
    color: 'blue', 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20',
    icon: CheckCircle2 
  },
  action: { 
    color: 'indigo', 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/20',
    icon: Zap 
  },
};

export function SmartInsights() {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'warning' | 'action'>('all');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleDismiss = (id: string) => {
    setDismissedInsights(prev => [...prev, id]);
  };

  const filteredInsights = insights
    .filter(i => !dismissedInsights.includes(i.id))
    .filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Smart Insights
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-sm text-gray-500">AI-powered recommendations</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'opportunity', 'warning', 'action'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full">
                  {insights.filter(i => i.type === f && !dismissedInsights.includes(i.id)).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Insights List */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredInsights.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-500">All caught up! No pending insights.</p>
            </motion.div>
          ) : (
            filteredInsights.map((insight, index) => {
              const config = typeConfig[insight.type];
              const Icon = insight.icon;
              const isExpanded = activeInsight === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 border-b border-gray-100 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                    config.bg
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${config.border} border`}>
                      <Icon className={`w-4 h-4 text-${config.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {insight.title}
                        </h4>
                        <button
                          onClick={() => handleDismiss(insight.id)}
                          className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {insight.description}
                      </p>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-400">Impact:</span>
                              <span className={`font-medium text-${config.color}-600`}>
                                {insight.impact}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => setActiveInsight(isExpanded ? null : insight.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                        <motion.button
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center gap-1 text-xs font-medium text-${config.color}-600 hover:text-${config.color}-700`}
                        >
                          {insight.action}
                          <ChevronRight className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Powered by Tenchi AI</span>
          <span>{filteredInsights.length} insights available</span>
        </div>
      </div>
    </div>
  );
}
