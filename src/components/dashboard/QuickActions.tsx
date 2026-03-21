'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Mail,
  Upload,
  RefreshCw,
  Calculator,
  TrendingUp,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    id: 'export-excel',
    title: 'Export to Excel',
    description: 'Download all data',
    icon: FileSpreadsheet,
    color: 'emerald',
    href: '/reports',
  },
  {
    id: 'export-pdf',
    title: 'Export to PDF',
    description: 'Generate report',
    icon: FileText,
    color: 'red',
    href: '/reports',
  },
  {
    id: 'email-report',
    title: 'Email Report',
    description: 'Share with team',
    icon: Mail,
    color: 'indigo',
    href: '/reports',
  },
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Update dashboard',
    icon: RefreshCw,
    color: 'blue',
    action: () => window.location.reload(),
  },
  {
    id: 'quick-calc',
    title: 'Quick Calculation',
    description: 'EOQ & Reorder',
    icon: Calculator,
    color: 'amber',
    href: '/optimizer',
  },
  {
    id: 'forecast-now',
    title: 'Run Forecast',
    description: 'AI prediction',
    icon: TrendingUp,
    color: 'purple',
    href: '/forecasting',
  },
];

export function QuickActions() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <Zap className="w-5 h-5 text-amber-500" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isColor = (color: string) => {
            const colors: Record<string, string> = {
              emerald: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
              red: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
              indigo: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20',
              blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
              amber: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
              purple: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20',
            };
            return colors[color] || colors.indigo;
          };

          const content = (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`w-full p-3 rounded-xl text-left transition-colors ${isColor(action.color)}`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </motion.button>
          );

          if (action.href) {
            return (
              <Link key={action.id} href={action.href}>
                {content}
              </Link>
            );
          }

          return <div key={action.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
