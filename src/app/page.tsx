'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Package, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, ArrowRight,
  Upload, CheckCircle2, Clock, AlertCircle, Sparkles,
  BarChart3, PieChart, Activity, Brain, Zap,
  Box, ShoppingCart, Target, Calendar, ChevronRight,
  TrendingDown, MoreHorizontal, RefreshCw, Database,
  FileSpreadsheet, MapPin, Flame, Target as TargetIcon
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import ParticleBackground from '@/components/3d/ParticleBackground';
import FloatingCard3D from '@/components/3d/FloatingCard3D';
import { AreaChart, BarChart, PieChart as PieChartComponent, RadarChart, FunnelChart, HeatmapChart, ComposedChart } from '@/components/charts';
import { getUploadedData, UploadedData } from '@/lib/uploadDataStore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
};

// Mock data for when no real data exists
const defaultRevenueData = [
  { name: 'Jan', revenue: 45000, orders: 120, forecast: 43000 },
  { name: 'Feb', revenue: 52000, orders: 135, forecast: 50000 },
  { name: 'Mar', revenue: 58000, orders: 148, forecast: 56000 },
  { name: 'Apr', revenue: 64000, orders: 162, forecast: 62000 },
  { name: 'May', revenue: 61000, orders: 155, forecast: 63000 },
  { name: 'Jun', revenue: 72000, orders: 178, forecast: 70000 },
];

const defaultCategoryData = [
  { name: 'Chocolate Candy', value: 450 },
  { name: 'Fruit Candy', value: 320 },
  { name: 'Toffee', value: 280 },
  { name: 'Mint Candy', value: 200 },
  { name: 'Gift Boxes', value: 150 },
];

const defaultAbcData = [
  { name: 'Class A', value: 156 },
  { name: 'Class B', value: 234 },
  { name: 'Class C', value: 390 },
];

const defaultPerformanceData = [
  { name: 'Week 1', actual: 85, target: 80 },
  { name: 'Week 2', actual: 92, target: 85 },
  { name: 'Week 3', actual: 78, target: 85 },
  { name: 'Week 4', actual: 95, target: 90 },
];

const defaultRadarData = [
  { subject: 'Sales', A: 85, B: 65, fullMark: 100 },
  { subject: 'Inventory', A: 70, B: 60, fullMark: 100 },
  { subject: 'Forecast', A: 90, B: 75, fullMark: 100 },
  { subject: 'Orders', A: 80, B: 70, fullMark: 100 },
  { subject: 'Customers', A: 75, B: 80, fullMark: 100 },
  { subject: 'Growth', A: 88, B: 72, fullMark: 100 }
];

const defaultFunnelData = [
  { name: 'Total Visitors', value: 15000, fill: '#6366f1' },
  { name: 'Product Views', value: 12500, fill: '#8b5cf6' },
  { name: 'Add to Cart', value: 7500, fill: '#a855f7' },
  { name: 'Checkout', value: 4500, fill: '#d946ef' },
  { name: 'Purchase', value: 2800, fill: '#ec4899' }
];

const defaultHeatmapData = [
  { x: 'Q1', y: 'North', value: 85 },
  { x: 'Q1', y: 'South', value: 65 },
  { x: 'Q1', y: 'East', value: 45 },
  { x: 'Q1', y: 'West', value: 75 },
  { x: 'Q2', y: 'North', value: 95 },
  { x: 'Q2', y: 'South', value: 55 },
  { x: 'Q2', y: 'East', value: 70 },
  { x: 'Q2', y: 'West', value: 60 },
  { x: 'Q3', y: 'North', value: 70 },
  { x: 'Q3', y: 'South', value: 80 },
  { x: 'Q3', y: 'East', value: 90 },
  { x: 'Q3', y: 'West', value: 50 },
  { x: 'Q4', y: 'North', value: 100 },
  { x: 'Q4', y: 'South', value: 85 },
  { x: 'Q4', y: 'East', value: 75 },
  { x: 'Q4', y: 'West', value: 95 }
];

const defaultTopProducts = [
  { name: 'Product A', sales: 45000, quantity: 1200, growth: 15.5 },
  { name: 'Product B', sales: 38000, quantity: 950, growth: -5.2 },
  { name: 'Product C', sales: 32000, quantity: 800, growth: 8.7 },
  { name: 'Product D', sales: 28000, quantity: 650, growth: 22.1 },
  { name: 'Product E', sales: 24000, quantity: 580, growth: -2.3 }
];

const defaultRegionalData = [
  { region: 'North America', sales: 125000, orders: 450, customers: 120 },
  { region: 'Europe', sales: 98000, orders: 320, customers: 95 },
  { region: 'Asia Pacific', sales: 145000, orders: 580, customers: 180 },
  { region: 'Latin America', sales: 65000, orders: 210, customers: 65 }
];

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1.5 }: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

function StatCard({ title, value, change, icon: Icon, prefix = '', suffix = '', color = 'indigo', index = 0, delay = 0 }: {
  title: string;
  value: number | string;
  change: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
  index?: number;
  delay?: number;
}) {
  const isPositive = change >= 0;
  const colorClasses = {
    indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/30',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/30',
    cyan: 'from-cyan-500 to-blue-600 shadow-cyan-500/30',
    violet: 'from-violet-500 to-purple-600 shadow-violet-500/30',
  };

  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : value;

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: delay + index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[color]} rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-500`} />
      <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:opacity-20 transition-opacity duration-500`} />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <motion.p className="text-slate-400 text-sm font-medium">{title}</motion.p>
            <motion.p 
              className="text-3xl font-bold text-white mt-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
            >
              {typeof value === 'number' ? (
                <AnimatedNumber value={numericValue} prefix={prefix} suffix={suffix} />
              ) : (
                `${prefix}${value}${suffix}`
              )}
            </motion.p>
            <div className="flex items-center gap-2 mt-3">
              <motion.span 
                className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isPositive 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + index * 0.1 + 0.4 }}
              >
                {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {Math.abs(change)}%
              </motion.span>
              <span className="text-slate-500 text-xs">vs last month</span>
            </div>
          </div>
          <motion.div 
            className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} opacity-50`} />
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon: Icon, href, color = 'indigo', index = 0 }: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
  index?: number;
}) {
  const colorClasses = {
    indigo: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-indigo-500/20',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/20',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 hover:border-rose-500/50 hover:shadow-rose-500/20',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-cyan-500/20',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/50 hover:shadow-violet-500/20',
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.6 + index * 0.1 }}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[color]} border rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:shadow-lg`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:bg-white/10 transition-all duration-500" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0, opacity: 1 }}
                className="text-white/60"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>
            <h3 className="font-semibold text-white text-lg mb-1">{title}</h3>
            <p className="text-sm text-white/60">{description}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function TopProductsTable({ products }: { products: any[] }) {
  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate group-hover:text-indigo-400 transition-colors">{product.name}</p>
            <p className="text-xs text-slate-500">{product.quantity.toLocaleString()} units</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">${product.sales.toLocaleString()}</p>
            <p className={`text-xs ${product.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {product.growth >= 0 ? '+' : ''}{product.growth}%
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RegionalPerformance({ data }: { data: any[] }) {
  const maxSales = Math.max(...data.map(d => d.sales));
  
  return (
    <div className="space-y-4">
      {data.map((region, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-medium">{region.region}</span>
            </div>
            <span className="text-slate-400 text-sm">${(region.sales / 1000).toFixed(0)}k</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(region.sales / maxSales) * 100}%` }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>{region.orders} orders</span>
            <span>{region.customers} customers</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Load from localStorage after mount (client-side only)
      setUploadedData(getUploadedData());
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const hasRealData = !!uploadedData;

  const stats = {
    totalOrders: uploadedData?.kpis.totalOrders || 1247,
    ordersChange: 8.5,
    revenue: uploadedData?.kpis.totalRevenue || 68400,
    revenueChange: 12.3,
    customers: 89,
    customersChange: 5.2,
    products: uploadedData?.kpis.totalSKUs || 156,
    productsChange: 3.1,
    forecastAccuracy: (uploadedData?.kpis.forecastAccuracy && uploadedData.kpis.forecastAccuracy > 0)
      ? Math.round(uploadedData.kpis.forecastAccuracy * 10) / 10
      : 87.5,
    accuracyChange: 2.8,
    inventoryValue: 68.4,
    inventoryChange: -4.2,
  };

  const revenueData = uploadedData?.monthlyTrend?.length
    ? uploadedData.monthlyTrend.map(m => ({ name: m.month, actual: m.actual, forecast: m.forecast }))
    : defaultRevenueData;

  const categoryData = uploadedData?.topCategories?.length
    ? uploadedData.topCategories
    : defaultCategoryData;

  const abcData = uploadedData?.abcDistribution?.length
    ? uploadedData.abcDistribution
    : defaultAbcData;

  const performanceData = uploadedData?.performanceData?.length
    ? uploadedData.performanceData
    : defaultPerformanceData;

  const uploadedRadarData = uploadedData?.radarData?.length ? uploadedData.radarData : null;
  const uploadedRadarKeys = uploadedData?.radarKeys?.length ? uploadedData.radarKeys : null;
  const radarData = defaultRadarData;
  const funnelData = defaultFunnelData;
  const heatmapData = defaultHeatmapData;
  const topProducts = uploadedData?.materials?.length
    ? uploadedData.materials.slice(0, 5).map(m => ({
        name: m.description || m.id,
        sales: Math.round(m.totalSales * Math.max(m.price, 1)),
        quantity: m.totalSales,
        growth: m.monthlySales.length >= 2
          ? Math.round(((m.monthlySales[m.monthlySales.length - 1] - m.monthlySales[0]) / Math.max(m.monthlySales[0], 1)) * 100)
          : 0,
      }))
    : defaultTopProducts;
  const regionalData = defaultRegionalData;

  if (showLogo) {
    return <AnimatedLogo onComplete={() => setShowLogo(false)} />;
  }

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 overflow-hidden">
      <ParticleBackground />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-[1600px] mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <motion.h1 className="text-3xl sm:text-4xl font-bold text-white">
                Welcome back
              </motion.h1>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Sparkles className="w-7 h-7 text-amber-400" />
              </motion.div>
            </motion.div>
            <motion.p className="text-slate-400 mt-1 text-lg">
              Here's what's happening with your S&OP today
            </motion.p>
            
            {/* Data Status Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-2"
            >
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                hasRealData
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {hasRealData ? (
                  <>
                    <Database className="w-3 h-3" />
                    Live Data Active
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3 h-3" />
                    Demo — Upload Excel to see real insights
                  </>
                )}
              </span>
              {hasRealData && uploadedData && (
                <span className="text-slate-500 text-xs">
                  {uploadedData.fileName} · {uploadedData.totalRows.toLocaleString()} rows
                </span>
              )}
            </motion.div>
          </div>
          <motion.div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg backdrop-blur-sm">
              <Calendar className="w-4 h-4" />
              Last 30 days
            </button>
            <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105">
              <Upload className="w-4 h-4" />
              Upload Data
            </Link>
          </motion.div>
        </motion.div>

        {/* Uploaded Data Info Banner */}
        {uploadedData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/20 flex-shrink-0">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-indigo-300 font-medium text-sm">
                Live data from: <span className="text-white">{uploadedData.fileName}</span>
              </p>
              <p className="text-indigo-400/60 text-xs mt-0.5">
                {uploadedData.totalRows.toLocaleString()} rows &bull; {uploadedData.materials.length} SKUs &bull; Format: {uploadedData.detectedFormat} &bull; Uploaded {new Date(uploadedData.uploadedAt).toLocaleString()}
              </p>
            </div>
            <Link href="/upload" className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Update
            </Link>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard title="Total Orders" value={stats.totalOrders} change={stats.ordersChange} icon={ShoppingCart} color="indigo" index={0} />
          <StatCard title="Revenue" value={stats.revenue} change={stats.revenueChange} icon={DollarSign} prefix="$" color="emerald" index={1} />
          <StatCard title="Customers" value={stats.customers} change={stats.customersChange} icon={Users} color="cyan" index={2} />
          <StatCard title="Products" value={stats.products} change={stats.productsChange} icon={Package} color="violet" index={3} />
          <StatCard title="Forecast Accuracy" value={stats.forecastAccuracy} change={stats.accuracyChange} icon={Target} suffix="%" color="amber" index={4} />
          <StatCard title="Inventory Value" value={typeof stats.inventoryValue === 'number' ? (stats.inventoryValue / 1000000).toFixed(1) : stats.inventoryValue} change={stats.inventoryChange} icon={Box} prefix="$" suffix="M" color="rose" index={5} />
        </motion.div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FloatingCard3D className="h-[420px]" glowColor="rgba(99, 102, 241, 0.2)">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Revenue & Orders Trend</h3>
                    <p className="text-sm text-slate-400">Monthly performance overview</p>
                  </div>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <AreaChart 
                  data={revenueData} 
                  height={320}
                  colors={['#6366f1', '#10b981', '#f59e0b']}
                />
              </div>
            </FloatingCard3D>
          </motion.div>

          {/* Radar Chart - Multi-dimensional Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FloatingCard3D className="h-[420px]" glowColor="rgba(236, 72, 153, 0.2)">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {uploadedRadarData ? 'Top Materials Comparison' : 'Performance Radar'}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {uploadedRadarData ? 'Top 5 SKUs across key metrics (normalized to 100)' : 'Multi-dimensional analysis'}
                    </p>
                  </div>
                  <TargetIcon className="w-5 h-5 text-pink-400" />
                </div>
                {uploadedRadarData && uploadedRadarKeys ? (
                  <RadarChart
                    data={uploadedRadarData}
                    keys={uploadedRadarKeys}
                    height={330}
                    colors={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
                  />
                ) : (
                  <RadarChart
                    data={radarData}
                    keys={['A', 'B']}
                    height={330}
                    colors={['#6366f1', '#ec4899']}
                  />
                )}
              </div>
            </FloatingCard3D>
          </motion.div>
        </div>

        {/* Category & Funnel Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <FloatingCard3D className="h-[400px]" glowColor="rgba(245, 158, 11, 0.2)">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
                    <p className="text-sm text-slate-400">Product category breakdown</p>
                  </div>
                </div>
                <PieChartComponent 
                  data={categoryData}
                  height={300}
                  donut={true}
                />
              </div>
            </FloatingCard3D>
          </motion.div>

          {/* Funnel Chart - Conversion Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="lg:col-span-2"
          >
            <FloatingCard3D className="h-[400px]" glowColor="rgba(139, 92, 246, 0.2)">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Conversion Funnel</h3>
                    <p className="text-sm text-slate-400">Customer journey analysis</p>
                  </div>
                  <Flame className="w-5 h-5 text-violet-400" />
                </div>
                <FunnelChart 
                  data={funnelData}
                  height={320}
                />
              </div>
            </FloatingCard3D>
          </motion.div>
        </div>

        {/* Heatmap & Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <FloatingCard3D className="h-[400px]" glowColor="rgba(16, 185, 129, 0.2)">
              <div className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Regional Performance Heatmap</h3>
                    <p className="text-sm text-slate-400">Sales intensity by region and quarter</p>
                  </div>
                </div>
                <HeatmapChart 
                  data={heatmapData}
                  height={300}
                  colorRange={['#1e293b', '#10b981']}
                />
              </div>
            </FloatingCard3D>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <FloatingCard3D className="h-[400px]" glowColor="rgba(245, 158, 11, 0.2)">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Top Products</h3>
                    <p className="text-sm text-slate-400">Best performing products</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 overflow-auto">
                  <TopProductsTable products={topProducts} />
                </div>
              </div>
            </FloatingCard3D>
          </motion.div>
        </div>

        {/* ABC Classification & Regional Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ABC Classification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <FloatingCard3D className="h-[380px]" glowColor="rgba(16, 185, 129, 0.2)">
              <div className="p-6 h-full">
                <h3 className="text-lg font-semibold text-white mb-2">ABC Classification</h3>
                <p className="text-sm text-slate-400 mb-4">Inventory value distribution</p>
                <PieChartComponent 
                  data={abcData}
                  height={260}
                  donut={true}
                  colors={['#10b981', '#f59e0b', '#64748b']}
                />
              </div>
            </FloatingCard3D>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <FloatingCard3D className="h-[380px]" glowColor="rgba(236, 72, 153, 0.2)">
              <div className="p-6 h-full">
                <h3 className="text-lg font-semibold text-white mb-2">Performance vs Target</h3>
                <p className="text-sm text-slate-400 mb-4">Weekly performance tracking</p>
                <BarChart 
                  data={performanceData}
                  height={270}
                  colors={['#6366f1', '#10b981']}
                />
              </div>
            </FloatingCard3D>
          </motion.div>

          {/* Regional Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <FloatingCard3D className="h-[380px]" glowColor="rgba(6, 182, 212, 0.2)">
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">Regional Sales</h3>
                <p className="text-sm text-slate-400 mb-4">Performance by region</p>
                <div className="flex-1 overflow-auto">
                  <RegionalPerformance data={regionalData} />
                </div>
              </div>
            </FloatingCard3D>
          </motion.div>
        </div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard title="ABC Analysis" description="View inventory classification" icon={PieChart} href="/abc-dashboard" color="indigo" index={0} />
            <QuickActionCard title="Forecasting" description="Demand planning & trends" icon={TrendingUp} href="/forecasting" color="emerald" index={1} />
            <QuickActionCard title="Order Optimizer" description="AI-powered replenishment" icon={Zap} href="/optimizer" color="amber" index={2} />
            <QuickActionCard title="AI Assistant" description="Ask questions & insights" icon={Brain} href="/ai-assistant" color="violet" index={3} />
          </div>
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white text-lg">Recent Uploads</h3>
            </div>
            <Link href="/upload" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {uploadedData ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.95 }}
                whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/10">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{uploadedData.fileName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {uploadedData.totalRows.toLocaleString()} rows · {uploadedData.materials.length} SKUs · {uploadedData.detectedFormat} format · {new Date(uploadedData.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Processed</span>
                </span>
              </motion.div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-slate-500">No uploads yet. Upload an Excel file to see your data here.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 mt-3 text-indigo-400 hover:text-indigo-300 text-sm">
                  Upload your first file
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
