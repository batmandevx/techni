'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  Database,
  Sparkles,
  Zap,
  BarChart3,
  Users,
  AlertTriangle
} from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  hasData: boolean;
}

const suggestions = [
  { 
    icon: TrendingUp, 
    text: 'What is our current forecast accuracy?',
    category: 'Analytics'
  },
  { 
    icon: Package, 
    text: 'Which products are at risk of stockout?',
    category: 'Inventory'
  },
  { 
    icon: Database, 
    text: 'Summarize our inventory position',
    category: 'Overview'
  },
  { 
    icon: Sparkles, 
    text: 'Recommend replenishment quantities for next month',
    category: 'Planning'
  },
  { 
    icon: Users, 
    text: 'Who are our top customers?',
    category: 'Customers'
  },
  { 
    icon: BarChart3, 
    text: 'Analyze sales trends this quarter',
    category: 'Sales'
  },
  { 
    icon: AlertTriangle, 
    text: 'Identify supply chain risks',
    category: 'Risk'
  },
  { 
    icon: Zap, 
    text: 'Generate ABC analysis report',
    category: 'Analysis'
  },
];

const capabilities = [
  {
    icon: Database,
    title: 'Data Analysis',
    description: 'Analyze your inventory, sales, and forecast data with AI-powered insights',
  },
  {
    icon: TrendingUp,
    title: 'Predictions',
    description: 'Get demand forecasts and trend analysis for better planning',
  },
  {
    icon: Package,
    title: 'Replenishment',
    description: 'Calculate optimal order quantities and safety stock levels',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Assessment',
    description: 'Identify stockout risks and supply chain disruptions early',
  },
];

export function WelcomeScreen({ onSuggestionClick, hasData }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          How can I help you today?
        </h1>
        <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto">
          {hasData 
            ? "I'm analyzing your S&OP data. Ask me anything about your supply chain, inventory, or forecasts."
            : "Upload your data to get AI-powered insights about your supply chain operations."}
        </p>
      </motion.div>

      {/* Suggestions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl mb-12"
      >
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 text-center">
          Suggested questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, i) => {
            const Icon = suggestion.icon;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="flex items-start gap-3 p-4 text-left bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
              >
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {suggestion.text}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {suggestion.category}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl"
      >
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4 text-center">
          What I can do
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {cap.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {cap.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
