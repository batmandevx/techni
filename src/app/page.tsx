'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Upload, 
  Settings,
  Sparkles,
  Bot,
  FileSpreadsheet,
  BarChart3,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button, Badge, StatCard } from '@/components/ui';

const modules = [
  {
    id: 'abc',
    title: 'ABC Analysis',
    description: 'Classify inventory by value contribution',
    icon: BarChart3,
    href: '/abc-dashboard',
    color: 'indigo' as const,
    features: ['Smart Classification', 'Stock Coverage', 'Age Analysis'],
    badge: 'Enhanced',
  },
  {
    id: 'forecast',
    title: 'Demand Forecasting',
    description: 'AI-powered demand predictions',
    icon: TrendingUp,
    href: '/forecast',
    color: 'emerald' as const,
    features: ['Seasonal Models', 'Scenario Planning', 'What-if Analysis'],
    badge: 'AI Powered',
  },
  {
    id: 'optimizer',
    title: 'Order Optimizer',
    description: 'EOQ & reorder optimization',
    icon: Package,
    href: '/optimizer',
    color: 'amber' as const,
    features: ['EOQ Calculation', 'Reorder Points', 'Cost Optimization'],
  },
  {
    id: 'upload',
    title: 'Data Import',
    description: 'Import Excel & CSV files',
    icon: Upload,
    href: '/upload',
    color: 'cyan' as const,
    features: ['Excel Support', 'Data Validation', 'Batch Import'],
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Generate & export reports',
    icon: FileSpreadsheet,
    href: '/reports',
    color: 'violet' as const,
    features: ['Custom Reports', 'Export PDF/Excel', 'Scheduled Reports'],
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get intelligent insights',
    icon: Bot,
    href: '/ai-assistant',
    color: 'rose' as const,
    features: ['Natural Language', 'Voice Input', 'File Analysis'],
    badge: 'New',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.175, 0.885, 0.32, 1.275],
    },
  },
};

export default function Dashboard() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tenchi S&OP
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">Smart Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/ai-assistant">
                <Button variant="primary" leftIcon={<Bot className="w-4 h-4" />}>
                  AI Assistant
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="p-2">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Choose a module to get started with your inventory planning
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          <StatCard
            title="Total SKUs"
            value="1,284"
            change={12}
            icon={<Package className="w-5 h-5 text-white" />}
            color="indigo"
            subtitle="Across all categories"
          />
          <StatCard
            title="Forecast Accuracy"
            value="94.2%"
            change={3.5}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="emerald"
            subtitle="Last 30 days"
          />
          <StatCard
            title="Low Stock Items"
            value="23"
            change={-5}
            icon={<BarChart3 className="w-5 h-5 text-white" />}
            color="amber"
            subtitle="Require attention"
          />
          <StatCard
            title="AI Insights"
            value="8"
            icon={<BrainCircuit className="w-5 h-5 text-white" />}
            color="rose"
            subtitle="New recommendations"
          />
        </motion.div>

        {/* Modules Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {modules.map((module) => {
            const Icon = module.icon;
            const isHovered = hoveredModule === module.id;
            
            const colorStyles = {
              indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
              emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
              amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
              rose: 'from-rose-500 to-pink-600 shadow-rose-500/30',
              cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/30',
              violet: 'from-violet-500 to-fuchsia-600 shadow-violet-500/30',
            };

            return (
              <motion.div
                key={module.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <Link href={module.href}>
                  <Card 
                    className="h-full group relative overflow-hidden"
                    hover
                  >
                    {/* Gradient Background on Hover */}
                    <motion.div
                      animate={{ 
                        opacity: isHovered ? 0.05 : 0,
                      }}
                      className={`absolute inset-0 bg-gradient-to-br ${colorStyles[module.color]}`}
                    />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[module.color]} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          {module.badge && (
                            <Badge variant={module.badge === 'New' ? 'success' : 'info'}>
                              {module.badge}
                            </Badge>
                          )}
                          <motion.div
                            animate={{ x: isHovered ? 4 : 0 }}
                            className="text-gray-400"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        {module.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {module.features.map((feature) => (
                          <span 
                            key={feature}
                            className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <Card padding="sm">
            <div className="space-y-4">
              {[
                { action: 'ABC Analysis completed', time: '2 hours ago', type: 'analysis' },
                { action: 'Q1 Forecast generated', time: '5 hours ago', type: 'forecast' },
                { action: '23 orders optimized', time: '1 day ago', type: 'order' },
                { action: 'Data imported successfully', time: '2 days ago', type: 'import' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'analysis' ? 'bg-indigo-500' :
                      item.type === 'forecast' ? 'bg-emerald-500' :
                      item.type === 'order' ? 'bg-amber-500' :
                      'bg-cyan-500'
                    }`} />
                    <span className="text-gray-700 dark:text-slate-300">{item.action}</span>
                  </div>
                  <span className="text-sm text-gray-400">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
