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
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  BarChart3,
  Activity,
  Truck,
  Warehouse,
  Target,
  Clock,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Layers,
  PieChart,
  TrendingDown,
  Box,
  MapPin,
  CreditCard,
  Hexagon,
  Radar,
  Grid3X3,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { ModernKPI } from '@/components/dashboard/ModernKPI';
import { ModernChart } from '@/components/dashboard/ModernChart';
import { InventoryTracker } from '@/components/dashboard/InventoryTracker';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { SmartGreeting } from '@/components/dashboard/SmartGreeting';
import {
  MultiAxisChart,
  StackedBarChart,
  ScatterTrendChart,
  DonutChart,
  HorizontalBarChart,
  AreaRangeChart,
  TreemapChart,
  GaugeChart,
  WaterfallChart,
  FunnelChartComponent,
  SpiderWebChart,
  HoneycombChart,
  PieChart3D,
  NightingaleRoseChart,
  BubbleChart,
  WaffleChart,
  MultiRadialChart,
  StepChart,
  CalendarHeatmap,
  FlowChart,
  PolarAreaChart,
} from '@/components/dashboard/AdvancedCharts';

// Comprehensive mock data
const multiAxisData = [
  { name: 'Mon', orders: 120, revenue: 8500 },
  { name: 'Tue', orders: 145, revenue: 11200 },
  { name: 'Wed', orders: 138, revenue: 9800 },
  { name: 'Thu', orders: 162, revenue: 13500 },
  { name: 'Fri', orders: 189, revenue: 16800 },
  { name: 'Sat', orders: 234, revenue: 22100 },
  { name: 'Sun', orders: 198, revenue: 18500 },
];

const stackedData = [
  { name: 'Jan', electronics: 45000, clothing: 32000, home: 28000, sports: 21000 },
  { name: 'Feb', electronics: 52000, clothing: 34000, home: 30000, sports: 22000 },
  { name: 'Mar', electronics: 48000, clothing: 31000, home: 29000, sports: 20000 },
  { name: 'Apr', electronics: 61000, clothing: 38000, home: 32000, sports: 25000 },
  { name: 'May', electronics: 58000, clothing: 40000, home: 35000, sports: 28000 },
  { name: 'Jun', electronics: 72000, clothing: 45000, home: 38000, sports: 32000 },
];

const scatterData = [
  { inventory: 12, sales: 450, profit: 120 },
  { inventory: 25, sales: 380, profit: 95 },
  { inventory: 18, sales: 520, profit: 150 },
  { inventory: 35, sales: 290, profit: 80 },
  { inventory: 22, sales: 410, profit: 110 },
  { inventory: 15, sales: 480, profit: 135 },
  { inventory: 28, sales: 350, profit: 90 },
  { inventory: 20, sales: 460, profit: 125 },
];

const donutData = [
  { name: 'Desktop', value: 45, color: '#6366f1' },
  { name: 'Mobile', value: 35, color: '#10b981' },
  { name: 'Tablet', value: 15, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const pie3DData = [
  { name: 'Electronics', value: 35, color: '#6366f1' },
  { name: 'Clothing', value: 25, color: '#10b981' },
  { name: 'Home', value: 20, color: '#f59e0b' },
  { name: 'Sports', value: 12, color: '#ef4444' },
  { name: 'Books', value: 8, color: '#8b5cf6' },
];

const nightingaleData = [
  { name: 'Q1', value: 45, color: '#6366f1' },
  { name: 'Q2', value: 65, color: '#10b981' },
  { name: 'Q3', value: 55, color: '#f59e0b' },
  { name: 'Q4', value: 80, color: '#ef4444' },
  { name: 'Q5', value: 35, color: '#8b5cf6' },
  { name: 'Q6', value: 50, color: '#06b6d4' },
];

const horizontalData = [
  { name: 'Electronics', value: 125000, color: '#6366f1' },
  { name: 'Clothing', value: 98000, color: '#10b981' },
  { name: 'Home', value: 76000, color: '#f59e0b' },
  { name: 'Sports', value: 54000, color: '#ef4444' },
  { name: 'Books', value: 32000, color: '#8b5cf6' },
];

const rangeData = [
  { name: 'Mon', stock: 85, threshold: 50 },
  { name: 'Tue', stock: 78, threshold: 50 },
  { name: 'Wed', stock: 65, threshold: 50 },
  { name: 'Thu', stock: 42, threshold: 50 },
  { name: 'Fri', stock: 38, threshold: 50 },
  { name: 'Sat', stock: 55, threshold: 50 },
  { name: 'Sun', stock: 72, threshold: 50 },
];

const treemapData = [
  { name: 'Electronics', size: 450, children: [{ name: 'Phones', size: 200 }, { name: 'Laptops', size: 150 }, { name: 'Accessories', size: 100 }] },
  { name: 'Clothing', size: 320, children: [{ name: 'Men', size: 150 }, { name: 'Women', size: 120 }, { name: 'Kids', size: 50 }] },
  { name: 'Home', size: 280, children: [{ name: 'Furniture', size: 150 }, { name: 'Decor', size: 80 }, { name: 'Kitchen', size: 50 }] },
  { name: 'Sports', size: 210, children: [{ name: 'Equipment', size: 120 }, { name: 'Apparel', size: 60 }, { name: 'Accessories', size: 30 }] },
];

const waterfallData = [
  { name: 'Opening', positive: 100000, negative: 0, total: 100000 },
  { name: 'Sales', positive: 45000, negative: 0, total: 145000 },
  { name: 'Returns', positive: 0, negative: -8000, total: 137000 },
  { name: 'Discounts', positive: 0, negative: -12000, total: 125000 },
  { name: 'Expenses', positive: 0, negative: -25000, total: 100000 },
  { name: 'Closing', positive: 0, negative: 0, total: 100000 },
];

const funnelData = [
  { name: 'Website Visits', value: 10000, fill: '#6366f1' },
  { name: 'Product Views', value: 6500, fill: '#8b5cf6' },
  { name: 'Add to Cart', value: 3200, fill: '#a855f7' },
  { name: 'Checkout', value: 1800, fill: '#d946ef' },
  { name: 'Purchases', value: 950, fill: '#ec4899' },
];

// Spider Web Data - Multi-layer
const spiderWebData = [
  { subject: 'Fulfillment', A: 85, B: 90, C: 75 },
  { subject: 'Inventory', A: 78, B: 85, C: 70 },
  { subject: 'Forecast', A: 92, B: 88, C: 80 },
  { subject: 'Quality', A: 88, B: 92, C: 85 },
  { subject: 'Delivery', A: 75, B: 80, C: 70 },
  { subject: 'Returns', A: 65, B: 70, C: 60 },
  { subject: 'Cost', A: 82, B: 85, C: 78 },
  { subject: 'Speed', A: 90, B: 88, C: 82 },
];

// Honeycomb Data
const honeycombData = [
  { name: 'Sales', value: 85, color: '#6366f1' },
  { name: 'Profit', value: 72, color: '#10b981' },
  { name: 'Growth', value: 68, color: '#f59e0b' },
  { name: 'Retention', value: 91, color: '#ef4444' },
  { name: 'NPS', value: 76, color: '#8b5cf6' },
  { name: 'CSAT', value: 88, color: '#06b6d4' },
  { name: 'Efficiency', value: 65, color: '#ec4899' },
  { name: 'Quality', value: 94, color: '#84cc16' },
];

// Bubble Chart Data (BCG Matrix style)
const bubbleData = [
  { x: 25, y: 20, z: 500, name: 'Product A', category: 'Stars' },
  { x: 10, y: 25, z: 800, name: 'Product B', category: 'Cash Cows' },
  { x: 30, y: 8, z: 300, name: 'Product C', category: 'Question Marks' },
  { x: 5, y: 5, z: 200, name: 'Product D', category: 'Dogs' },
  { x: 35, y: 22, z: 600, name: 'Product E', category: 'Stars' },
  { x: 8, y: 28, z: 900, name: 'Product F', category: 'Cash Cows' },
  { x: 22, y: 12, z: 400, name: 'Product G', category: 'Question Marks' },
  { x: 2, y: 3, z: 150, name: 'Product H', category: 'Dogs' },
];

// Multi Radial Data
const multiRadialData = [
  { name: 'Q1 Sales', value: 85, fill: '#6366f1' },
  { name: 'Q2 Sales', value: 92, fill: '#10b981' },
  { name: 'Q3 Sales', value: 78, fill: '#f59e0b' },
  { name: 'Q4 Sales', value: 95, fill: '#ef4444' },
];

// Step Chart Data
const stepData = [
  { name: 'Jan', value: 40, target: 45 },
  { name: 'Feb', value: 45, target: 45 },
  { name: 'Mar', value: 42, target: 50 },
  { name: 'Apr', value: 55, target: 50 },
  { name: 'May', value: 58, target: 55 },
  { name: 'Jun', value: 65, target: 60 },
  { name: 'Jul', value: 62, target: 65 },
];

// Calendar Heatmap Data
const calendarData = [...Array(70)].map((_, i) => ({
  date: `Day ${i + 1}`,
  value: Math.floor(Math.random() * 100),
}));

// Flow Chart Data
const flowData = [
  { stage: 'Leads', value: 1000, color: '#6366f1' },
  { stage: 'Qualified', value: 650, color: '#8b5cf6' },
  { stage: 'Proposal', value: 420, color: '#a855f7' },
  { stage: 'Negotiation', value: 280, color: '#d946ef' },
  { stage: 'Closed', value: 185, color: '#ec4899' },
];

// Polar Area Data
const polarAreaData = [
  { name: 'North', value: 85, fullMark: 100 },
  { name: 'South', value: 65, fullMark: 100 },
  { name: 'East', value: 78, fullMark: 100 },
  { name: 'West', value: 92, fullMark: 100 },
  { name: 'Central', value: 70, fullMark: 100 },
  { name: 'Online', value: 95, fullMark: 100 },
];

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
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '#' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '#', badge: 3 },
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
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

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Link key={item.id} href={item.href} onClick={() => setActiveTab(item.id)}>
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all
                    ${isActive ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30' : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">{item.badge}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900/95">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.id} whileHover={{ x: 4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-slate-800/50 hover:text-white cursor-pointer transition-all">
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
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <Menu className="w-5 h-5 text-gray-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-sm text-gray-400">
                    {currentDate || 'Loading...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Search anything..." className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48" />
                  <kbd className="px-2 py-0.5 bg-slate-800 rounded-lg text-xs text-gray-500">⌘K</kbd>
                </div>

                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-slate-800">
                          <h3 className="font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full ${notif.type === 'warning' ? 'bg-amber-500' : notif.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
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
          {/* Smart Greeting */}
          <SmartGreeting userName="John" />

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModernKPI title="Total Revenue" value="$284,520" change={12.5} icon={<DollarSign className="w-6 h-6" />} color="emerald" sparklineData={[30, 45, 35, 50, 40, 60, 55, 70]} />
            <ModernKPI title="Total Orders" value="1,429" change={8.2} icon={<ShoppingCart className="w-6 h-6" />} color="indigo" sparklineData={[25, 40, 30, 45, 35, 50, 45, 60]} />
            <ModernKPI title="Active Customers" value="892" change={5.7} icon={<Users className="w-6 h-6" />} color="blue" sparklineData={[20, 35, 25, 40, 30, 45, 40, 55]} />
            <ModernKPI title="Inventory Value" value="$1.2M" change={-2.3} icon={<Package className="w-6 h-6" />} color="amber" sparklineData={[40, 35, 45, 30, 40, 35, 45, 30]} />
          </div>

          {/* Charts Row 1 - Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue vs Orders</h3>
                  <p className="text-sm text-gray-400">Dual-axis comparison</p>
                </div>
                <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <MultiAxisChart data={multiAxisData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
                  <p className="text-sm text-gray-400">Stacked view</p>
                </div>
                <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <StackedBarChart data={stackedData} />
            </div>
          </div>

          {/* Charts Row 2 - Advanced Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Channel Distribution</h3>
                  <p className="text-sm text-gray-400">Sales by platform</p>
                </div>
              </div>
              <DonutChart data={donutData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Inventory Correlation</h3>
                  <p className="text-sm text-gray-400">Days vs Sales volume</p>
                </div>
              </div>
              <ScatterTrendChart data={scatterData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Category Leaders</h3>
                  <p className="text-sm text-gray-400">Revenue by category</p>
                </div>
              </div>
              <HorizontalBarChart data={horizontalData} />
            </div>
          </div>

          {/* NEW: Charts Row 3 - Spider Web & Honeycomb */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Spider Web Analysis</h3>
                    <p className="text-sm text-gray-400">Multi-layer KPI comparison</p>
                  </div>
                </div>
              </div>
              <SpiderWebChart data={spiderWebData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Honeycomb Metrics</h3>
                    <p className="text-sm text-gray-400">Hexagonal performance grid</p>
                  </div>
                </div>
              </div>
              <HoneycombChart data={honeycombData} />
            </div>
          </div>

          {/* NEW: Charts Row 4 - Pie Charts & Rose */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-pink-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">3D Pie Chart</h3>
                    <p className="text-sm text-gray-400">Interactive segments</p>
                  </div>
                </div>
              </div>
              <PieChart3D data={pie3DData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Nightingale Rose</h3>
                    <p className="text-sm text-gray-400">Polar area distribution</p>
                  </div>
                </div>
              </div>
              <NightingaleRoseChart data={nightingaleData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">BCG Matrix</h3>
                    <p className="text-sm text-gray-400">Portfolio analysis</p>
                  </div>
                </div>
              </div>
              <BubbleChart data={bubbleData} />
            </div>
          </div>

          {/* Middle Section: Inventory + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryTracker />
            <ActivityFeed />
          </div>

          {/* Charts Row 5 - More Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Stock Levels</h3>
                  <p className="text-sm text-gray-400">With threshold</p>
                </div>
              </div>
              <AreaRangeChart data={rangeData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Conversion Funnel</h3>
                  <p className="text-sm text-gray-400">Customer journey</p>
                </div>
              </div>
              <FunnelChartComponent data={funnelData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Profit Waterfall</h3>
                  <p className="text-sm text-gray-400">P&L breakdown</p>
                </div>
              </div>
              <WaterfallChart data={waterfallData} />
            </div>
          </div>

          {/* NEW: Charts Row 6 - Waffle, Multi-Radial, Step */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Target Progress</h3>
                    <p className="text-sm text-gray-400">Waffle visualization</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <WaffleChart percentage={78} label="Q3 Target Achieved" color="#10b981" />
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Quarterly Rings</h3>
                  <p className="text-sm text-gray-400">Multi-radial comparison</p>
                </div>
              </div>
              <MultiRadialChart data={multiRadialData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Step Progress</h3>
                  <p className="text-sm text-gray-400">Discrete milestones</p>
                </div>
              </div>
              <StepChart data={stepData} />
            </div>
          </div>

          {/* NEW: Charts Row 7 - Calendar Heatmap & Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Activity Heatmap</h3>
                    <p className="text-sm text-gray-400">Daily order intensity</p>
                  </div>
                </div>
              </div>
              <CalendarHeatmap data={calendarData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sales Flow</h3>
                    <p className="text-sm text-gray-400">Pipeline conversion</p>
                  </div>
                </div>
              </div>
              <FlowChart data={flowData} />
            </div>
          </div>

          {/* NEW: Charts Row 8 - Polar Area & Treemap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Regional Sales</h3>
                  <p className="text-sm text-gray-400">Polar area by region</p>
                </div>
              </div>
              <PolarAreaChart data={polarAreaData} />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Category Treemap</h3>
                  <p className="text-sm text-gray-400">Hierarchical breakdown</p>
                </div>
              </div>
              <TreemapChart data={treemapData} />
            </div>
          </div>

          {/* Charts Row 9 - Gauges and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Service Level</h3>
              <GaugeChart value={94.5} label="On-time Delivery" />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Forecast Accuracy</h3>
              <GaugeChart value={87.2} label="Prediction Rate" />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Inventory Health</h3>
              <GaugeChart value={78.9} label="Stock Optimization" />
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Quality Score</h3>
              <GaugeChart value={96.1} label="Defect Rate" />
            </div>
          </div>

          {/* Charts Row 10 - Full Width Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart title="Revenue Overview" subtitle="Monthly revenue vs target" data={revenueData} type="area" dataKeys={['revenue', 'target']} colors={['#6366f1', '#10b981']} height={350} />
            <ModernChart title="Order Status" subtitle="Current order distribution" data={orderStatusData} type="pie" height={350} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ModernChart title="Sales by Category" subtitle="Revenue breakdown" data={categoryData} type="bar" dataKeys={['sales', 'profit']} colors={['#6366f1', '#10b981']} height={300} />
            <ModernChart title="Performance Radar" subtitle="Supply chain KPIs" data={radarData} type="radar" dataKeys={['A']} colors={['#8b5cf6']} height={300} />
            
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">{index + 1}</div>
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
                <motion.button key={index} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${action.color} text-white flex items-center gap-3 shadow-lg`}>
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
