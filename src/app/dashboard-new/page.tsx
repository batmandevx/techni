'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertCircle,
  Calendar,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Truck,
  Warehouse,
  Target,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { ModernKPI } from '@/components/dashboard/ModernKPI';
import { ModernChart } from '@/components/dashboard/ModernChart';
import { InventoryTracker } from '@/components/dashboard/InventoryTracker';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

// Mock data for charts
const revenueData = [
  { name: 'Jan', revenue: 45000, target: 42000, expenses: 32000 },
  { name: 'Feb', revenue: 52000, target: 48000, expenses: 35000 },
  { name: 'Mar', revenue: 48000, target: 50000, expenses: 33000 },
  { name: 'Apr', revenue: 61000, target: 55000, expenses: 38000 },
  { name: 'May', revenue: 58000, target: 60000, expenses: 40000 },
  { name: 'Jun', revenue: 72000, target: 65000, expenses: 45000 },
  { name: 'Jul', revenue: 68000, target: 70000, expenses: 42000 },
];

const orderStatusData = [
  { name: 'Pending', value: 23, color: '#f59e0b' },
  { name: 'Processing', value: 45, color: '#3b82f6' },
  { name: 'Shipped', value: 67, color: '#06b6d4' },
  { name: 'Delivered', value: 156, color: '#10b981' },
  { name: 'Cancelled', value: 8, color: '#ef4444' },
];

const categoryData = [
  { name: 'Electronics', sales: 45000, profit: 12000 },
  { name: 'Clothing', sales: 32000, profit: 8500 },
  { name: 'Home', sales: 28000, profit: 6000 },
  { name: 'Sports', sales: 21000, profit: 4500 },
  { name: 'Books', sales: 15000, profit: 3000 },
];

const radarData = [
  { name: 'Fulfillment', A: 120, fullMark: 150 },
  { name: 'Inventory', A: 98, fullMark: 150 },
  { name: 'Forecast', A: 86, fullMark: 150 },
  { name: 'Quality', A: 99, fullMark: 150 },
  { name: 'Delivery', A: 85, fullMark: 150 },
  { name: 'Returns', A: 65, fullMark: 150 },
];

const topProducts = [
  { name: 'Wireless Headphones Pro', sales: 1234, growth: 23, stock: 45 },
  { name: 'Smart Watch Series 7', sales: 982, growth: 18, stock: 32 },
  { name: 'Laptop Stand Premium', sales: 856, growth: -5, stock: 67 },
  { name: 'USB-C Hub 7-in-1', sales: 743, growth: 31, stock: 89 },
  { name: 'Mechanical Keyboard', sales: 698, growth: 12, stock: 23 },
];

const notifications = [
  { id: 1, title: 'Low stock alert', message: 'Wireless Mouse stock below threshold', time: '5 min ago', type: 'warning' },
  { id: 2, title: 'New order', message: 'Order #ORD-8921 received', time: '12 min ago', type: 'success' },
  { id: 3, title: 'Shipment delayed', message: 'FedEx shipment TRK-9921 delayed', time: '1 hour ago', type: 'error' },
];

export default function ModernDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    setTimeout(() => setIsLoading(false), 1500);
    return () => clearInterval(timer);
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '#' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders', badge: 12 },
    { id: 'inventory', label: 'Inventory', icon: Package, href: '/abc-dashboard' },
    { id: 'customers', label: 'Customers', icon: Users, href: '#' },
    { id: 'shipments', label: 'Shipments', icon: Truck, href: '#' },
    { id: 'forecasting', label: 'Forecasting', icon: Target, href: '/forecasting' },
    { id: 'warehouse', label: 'Warehouse', icon: Warehouse, href: '#' },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
    { id: 'logout', label: 'Logout', icon: LogOut, href: '#' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Preparing your supply chain insights...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Tenchi</h1>
              <p className="text-xs text-gray-400">Supply Chain OS</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link key={item.id} href={item.href} onClick={() => setActiveTab(item.id)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-2xl transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30' 
                      : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900/95">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-slate-800/50 hover:text-white cursor-pointer transition-all"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-sm text-gray-400">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
                  />
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded-lg text-xs text-gray-500">⌘K</kbd>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-800">
                          <h3 className="font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full ${
                                  notif.type === 'warning' ? 'bg-amber-500' :
                                  notif.type === 'error' ? 'bg-rose-500' :
                                  'bg-emerald-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-medium text-white">{notif.title}</p>
                                  <p className="text-xs text-gray-400">{notif.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white">John Doe</p>
                    <p className="text-xs text-gray-400">Admin</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-indigo-100 text-sm font-medium">AI-Powered Insights</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, John! 👋</h2>
                <p className="text-indigo-100 max-w-xl">
                  Your supply chain is performing excellently. Inventory turnover is up 23% and forecast accuracy is at 94.5%.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">94.5%</p>
                  <p className="text-sm text-indigo-200">Forecast Accuracy</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">+23%</p>
                  <p className="text-sm text-indigo-200">vs Last Month</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernKPI
              title="Total Revenue"
              value="$284,520"
              change={12.5}
              icon={<DollarSign className="w-6 h-6" />}
              color="emerald"
              sparklineData={[30, 45, 35, 50, 40, 60, 55, 70]}
            />
            <ModernKPI
              title="Total Orders"
              value="1,429"
              change={8.2}
              icon={<ShoppingCart className="w-6 h-6" />}
              color="indigo"
              sparklineData={[25, 40, 30, 45, 35, 50, 45, 60]}
            />
            <ModernKPI
              title="Active Customers"
              value="892"
              change={5.7}
              icon={<Users className="w-6 h-6" />}
              color="blue"
              sparklineData={[20, 35, 25, 40, 30, 45, 40, 55]}
            />
            <ModernKPI
              title="Inventory Value"
              value="$1.2M"
              change={-2.3}
              icon={<Package className="w-6 h-6" />}
              color="amber"
              sparklineData={[40, 35, 45, 30, 40, 35, 45, 30]}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ModernChart
              title="Revenue Overview"
              subtitle="Monthly revenue vs target"
              data={revenueData}
              type="area"
              dataKeys={['revenue', 'target']}
              colors={['#6366f1', '#10b981']}
              height={350}
              className="lg:col-span-2"
            />
            <ModernChart
              title="Order Status"
              subtitle="Current order distribution"
              data={orderStatusData}
              type="pie"
              height={350}
            />
          </div>

          {/* Middle Section: Inventory + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryTracker />
            <ActivityFeed />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ModernChart
              title="Sales by Category"
              subtitle="Revenue breakdown by product category"
              data={categoryData}
              type="bar"
              dataKeys={['sales', 'profit']}
              colors={['#6366f1', '#10b981']}
              height={300}
            />
            <ModernChart
              title="Performance Metrics"
              subtitle="Supply chain KPI radar"
              data={radarData}
              type="radar"
              dataKeys={['A']}
              colors={['#8b5cf6']}
              height={300}
            />
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sales.toLocaleString()} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-sm ${product.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {product.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{Math.abs(product.growth)}%</span>
                      </div>
                      <p className="text-xs text-gray-500">{product.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Create Order', icon: ShoppingCart, color: 'from-indigo-500 to-blue-600' },
              { label: 'Add Product', icon: Package, color: 'from-emerald-500 to-teal-600' },
              { label: 'View Reports', icon: BarChart3, color: 'from-amber-500 to-orange-600' },
              { label: 'Settings', icon: Settings, color: 'from-slate-500 to-slate-600' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${action.color} text-white flex items-center gap-3 shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
