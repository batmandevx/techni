'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  RotateCcw, 
  PackageCheck, 
  Calendar, 
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight,
  Zap,
  Package,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Layers,
  Sparkles,
  Hexagon,
  Box,
  Globe,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { TodoList } from '@/components/dashboard/TodoList';

// User Greeting Component
function UserGreeting() {
  const [greeting, setGreeting] = useState('Welcome');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
      borderRadius: '16px',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'white',
      }}>
        AD
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>{greeting},</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Administrator</div>
      </div>
    </div>
  );
}

// Animated Counter
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// KPI Card
function KPICard({ title, value, suffix, prefix, trend, icon: Icon, color, delay, subtitle, maxValue }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const barPct = maxValue ? Math.min((value / maxValue) * 100, 100) : Math.min(value, 100);

  return (
    <div
      className="card-modern"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            {title}
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#f8fafc' }}>
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
          </div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{subtitle}</div>}
        </div>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${color}40, ${color}20)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isHovered ? `0 0 30px ${color}60` : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: trend >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: trend >= 0 ? '#34d399' : '#f87171',
        }}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>vs last month</span>
      </div>

      <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${barPct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          borderRadius: '2px',
          transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  );
}

// 3D Bar Chart Component
function Bar3D({ data }: { data: any[] }) {
  // Find maximum value to normalize heights to fit within the container
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const containerHeight = 160; // Max visual height for the bars
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 220, padding: '10px 10px 20px 10px', marginTop: '1rem' }}>
      {data.map((item, i) => {
        // Calculate normalized height
        const normalizedHeight = Math.max((item.value / maxVal) * containerHeight, 20);
        
        return (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', height: `${normalizedHeight}px`, width: 36 }}>
            {/* Top Face */}
            <div style={{
              position: 'absolute',
              bottom: normalizedHeight - 18,
              left: 9,
              width: 36,
              height: 18,
              background: item.color,
              transform: 'skewX(-45deg)',
              opacity: 0.8,
            }} />
            {/* Front Face */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 9,
              width: 36,
              height: normalizedHeight,
              background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
              boxShadow: `0 4px 15px ${item.color}50`,
            }} />
            {/* Side Face */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 45,
              width: 18,
              height: normalizedHeight,
              backgroundColor: item.color,
              transform: 'skewY(-45deg)',
              opacity: 0.6,
            }} />
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>{item.name}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>{item.value}</span>
        </div>
      )})}
    </div>
  );
}

// Honeycomb Grid
function HoneycombGrid({ data }: { data: any[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '20px' }}>
      {data.map((item, i) => (
        <div
          key={i}
          style={{
            width: 70,
            height: 80,
            background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.filter = 'brightness(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          <div style={{ fontSize: '1.2rem' }}>{item.value}</div>
          <div style={{ fontSize: '0.5rem', textAlign: 'center' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Activity Item
function ActivityItem({ icon: Icon, title, desc, time, color }: any) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.03)',
      marginBottom: '8px',
      transition: 'all 0.3s',
      cursor: 'pointer',
    }} className="hover-lift">
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{time}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { kpis, orders, customers, materials, isLoading, refreshData } = useData();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real data calculations
  const realData = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalRevenue / orders.length;
    const fulfilledOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'INVOICED').length;
    const fillRate = orders.length > 0 ? (fulfilledOrders / orders.length) * 100 : 0;
    
    // Country distribution from real customers
    const countryCount: Record<string, number> = {};
    customers?.forEach(c => {
      countryCount[c.country] = (countryCount[c.country] || 0) + 1;
    });
    
    const pieData = Object.entries(countryCount).map(([name, value], i) => ({
      name,
      value,
      fill: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
    }));

    // Monthly revenue data from orders
    const monthlyData: Record<string, number> = {};
    orders.forEach(o => {
      const month = new Date(o.orderDate).toLocaleString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (o.totalAmount || 0);
    });
    
    const revenueData = Object.entries(monthlyData).map(([name, value]) => ({
      name,
      value: Math.round(value),
      target: Math.round(value * 0.9)
    }));

    // Material performance (honeycomb data)
    const materialCount: Record<string, number> = {};
    orders.forEach(o => {
      o.lines?.forEach((l: any) => {
        materialCount[l.material?.description || l.materialId] = (materialCount[l.material?.description || l.materialId] || 0) + l.quantity;
      });
    });
    
    const honeycombData = Object.entries(materialCount)
      .slice(0, 6)
      .map(([label, value], i) => ({
        label: label.split(' ').slice(0, 2).join(' '),
        value,
        color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i]
      }));

    // 3D Bar data
    const bar3dData = materials?.slice(0, 5).map((m, i) => ({
      name: m.id,
      value: Math.round(Math.random() * 500 + 200),
      color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i]
    })) || [];

    // Scatter plot data
    const scatterData = orders.slice(0, 20).map((o, i) => ({
      x: o.lines?.reduce((sum: number, l: any) => sum + l.quantity, 0) || 0,
      y: o.totalAmount || 0,
      z: Math.random() * 100 + 50,
      name: o.orderId
    }));

    // Supply Chain Velocity Data (Weekly Aggregation)
    const weeklyData: Record<string, { demand: number, supply: number }> = {};
    orders.forEach(o => {
      const d = new Date(o.orderDate);
      // Simplify by grouping by month-week e.g. "Jun W1"
      const weekLabel = `${d.toLocaleString('en-US', { month: 'short' })} W${Math.ceil(d.getDate() / 7)}`;
      // Estimate units as totalAmount / 100 for visual sake, or use lines
      const units = o.lines ? o.lines.reduce((acc: number, l: any) => acc + l.quantity, 0) : Math.floor((o.totalAmount || 0) / 100);
      
      if (!weeklyData[weekLabel]) {
        weeklyData[weekLabel] = { demand: 0, supply: 0 };
      }
      weeklyData[weekLabel].demand += units;
      // Synthesize supply target slightly above demand to represent capacity
      weeklyData[weekLabel].supply += units * (1 + (Math.random() * 0.2)); 
    });

    const velocityData = Object.entries(weeklyData).slice(0, 7).map(([name, data]) => ({
      name,
      demand: Math.round(data.demand),
      supply: Math.round(data.supply),
      velocity: Math.min(Math.round((data.demand / Math.max(data.supply, 1)) * 100), 100)
    }));

    // Radar Data (Supplier / Ops Performance)
    // Using overall Fill Rate as a baseline health metric to influence other abstract metrics
    const baseHealth = fillRate > 0 ? fillRate : 85; 
    const radarData = [
      { name: 'Quality', value: Math.min(baseHealth + 5, 100), fill: '#6366f1' },
      { name: 'Delivery', value: Math.min(baseHealth - 2, 100), fill: '#10b981' },
      { name: 'Cost', value: Math.min(baseHealth + 2, 100), fill: '#f59e0b' },
      { name: 'Flexibility', value: Math.max(baseHealth - 10, 60), fill: '#ef4444' },
      { name: 'Innovation', value: 75, fill: '#8b5cf6' },
      { name: 'Sustainability', value: 80, fill: '#06b6d4' },
    ];

    return {
      totalRevenue,
      avgOrderValue,
      fillRate,
      pieData,
      revenueData,
      honeycombData,
      bar3dData,
      scatterData,
      velocityData: velocityData.length > 0 ? velocityData : null,
      radarData
    };
  }, [orders, customers, materials]);

  // Mock data for initial load
  const mockRevenueData = [
    { name: 'Jan', value: 45000, target: 40000 },
    { name: 'Feb', value: 52000, target: 48000 },
    { name: 'Mar', value: 68000, target: 55000 },
    { name: 'Apr', value: 61000, target: 58000 },
    { name: 'May', value: 78000, target: 65000 },
    { name: 'Jun', value: 85000, target: 72000 },
  ];

  const mockPieData = [
    { name: 'UAE', value: 45, fill: '#6366f1' },
    { name: 'Qatar', value: 20, fill: '#10b981' },
    { name: 'KSA', value: 18, fill: '#f59e0b' },
    { name: 'Nepal', value: 10, fill: '#ef4444' },
    { name: 'Sri Lanka', value: 7, fill: '#8b5cf6' },
  ];

  const mockHoneycombData = [
    { label: 'M2001', value: 92, color: '#6366f1' },
    { label: 'M2002', value: 87, color: '#10b981' },
    { label: 'M2003', value: 73, color: '#f59e0b' },
    { label: 'M2004', value: 95, color: '#ef4444' },
    { label: 'M2005', value: 81, color: '#8b5cf6' },
    { label: 'Avg', value: 85, color: '#06b6d4' },
  ];

  const mockBar3dData = [
    { name: 'M2001', value: 450, color: '#6366f1' },
    { name: 'M2002', value: 320, color: '#10b981' },
    { name: 'M2003', value: 280, color: '#f59e0b' },
    { name: 'M2004', value: 390, color: '#ef4444' },
    { name: 'M2005', value: 340, color: '#8b5cf6' },
  ];

  const mockVelocityData = [
    { name: 'W1', demand: 4000, supply: 4200, velocity: 85 },
    { name: 'W2', demand: 3000, supply: 3200, velocity: 78 },
    { name: 'W3', demand: 2000, supply: 2100, velocity: 90 },
    { name: 'W4', demand: 2780, supply: 2900, velocity: 82 },
    { name: 'W5', demand: 1890, supply: 4800, velocity: 65 },
    { name: 'W6', demand: 2390, supply: 3800, velocity: 75 },
    { name: 'W7', demand: 3490, supply: 4300, velocity: 88 },
  ];

  const mockRadarData = [
    { subject: 'Quality', A: 120, B: 110, fullMark: 150 },
    { subject: 'Delivery', A: 98, B: 130, fullMark: 150 },
    { subject: 'Cost', A: 86, B: 130, fullMark: 150 },
    { subject: 'Flexibility', A: 99, B: 100, fullMark: 150 },
    { subject: 'Innovation', A: 85, B: 90, fullMark: 150 },
    { subject: 'Sustainability', A: 65, B: 85, fullMark: 150 },
  ];

  const activities = [
    { icon: Zap, title: 'New Order Received', desc: orders?.[0]?.orderId ? `${orders[0].orderId} - ${orders[0].customer?.name || 'New Customer'}` : 'SO5089 - Al Noor Trading', time: '2m ago', color: '#f59e0b' },
    { icon: AlertTriangle, title: 'Low Stock Alert', desc: 'M2001 below safety threshold', time: '15m ago', color: '#ef4444' },
    { icon: TrendingUp, title: 'Forecast Updated', desc: 'Q2 demand forecast completed', time: '1h ago', color: '#10b981' },
    { icon: Package, title: 'Order Shipped', desc: 'SO5078 - Oasis Superstores', time: '2h ago', color: '#6366f1' },
    { icon: Users, title: 'New Customer', desc: 'Gulf Retail LLC onboarded', time: '3h ago', color: '#8b5cf6' },
  ];

  if (!mounted) return null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(90deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {orders?.length > 0 
              ? `Showing real-time data from ${orders.length} orders and ${customers?.length || 0} customers`
              : 'Welcome! Upload data to see real-time analytics.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <UserGreeting />
          <button className="btn-modern btn-secondary-modern" onClick={() => refreshData()}>
            <RefreshCw size={18} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <Link href="/upload" className="btn-modern btn-primary-modern" style={{ textDecoration: 'none' }}>
            <FileSpreadsheet size={18} />
            Upload Data
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi" style={{ marginBottom: '2rem' }}>
        <KPICard
          title="Total Revenue"
          value={Math.round(realData?.totalRevenue || 0)}
          prefix="$"
          trend={12.5}
          icon={DollarSign}
          color="#6366f1"
          delay={0}
          subtitle="Across all orders"
          maxValue={Math.max(realData?.totalRevenue || 1, 100000)}
        />
        <KPICard
          title="Total Orders"
          value={orders?.length || 0}
          trend={8.3}
          icon={ShoppingBag}
          color="#10b981"
          delay={0.1}
          subtitle="Active orders"
          maxValue={Math.max(orders?.length || 1, 200)}
        />
        <KPICard
          title="Fill Rate"
          value={Math.round(realData?.fillRate || 96)}
          suffix="%"
          trend={2.1}
          icon={PackageCheck}
          color="#f59e0b"
          delay={0.2}
          subtitle="Order fulfillment"
          maxValue={100}
        />
        <KPICard
          title="Customers"
          value={customers?.length || 0}
          trend={15}
          icon={Users}
          color="#06b6d4"
          delay={0.3}
          subtitle="Active accounts"
          maxValue={Math.max(customers?.length || 1, 50)}
        />
        <KPICard
          title="Avg Order Value"
          value={Math.round(realData?.avgOrderValue || 0)}
          prefix="$"
          trend={-2.5}
          icon={TrendingUp}
          color="#8b5cf6"
          delay={0.4}
          subtitle="Per transaction"
          maxValue={Math.max(realData?.avgOrderValue || 1, 5000)}
        />
      </div>

      {/* Main Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(12, 1fr)', 
        gap: '1.5rem', 
        marginBottom: '1.5rem' 
      }}>
        {/* Revenue Chart (Spans 8 cols) */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 8', animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f130, #6366f110)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={20} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Revenue Trends</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Monthly performance</p>
              </div>
            </div>
            <select className="input-modern" style={{ width: 'auto' }}>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realData?.revenueData || mockRevenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#colorValue)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#1e1b4b', strokeWidth: 3 }} />
                <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Todo List Widget (Spans 4 cols) */}
        <div style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
          <TodoList />
        </div>
      </div>

      {/* Advanced Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Country Distribution (Pie Chart) */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 0.7s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf630, #8b5cf610)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sales by Region</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Geographic breakdown</p>
            </div>
          </div>
          <div style={{ height: 240, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={realData?.pieData || mockPieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={85} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="transparent"
                >
                  {(realData?.pieData || mockPieData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.3))' }} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} itemStyle={{ color: '#fff' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3D Bar Chart */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 0.8s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b30, #f59e0b10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>3D Inventory View</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock distribution</p>
            </div>
          </div>
          <Bar3D data={realData?.bar3dData || mockBar3dData} />
        </div>

        {/* Honeycomb Performance */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 0.9s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b98130, #10b98110)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hexagon size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Material Performance</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Top moving items</p>
            </div>
          </div>
          <HoneycombGrid data={realData?.honeycombData || mockHoneycombData} />
        </div>
      </div>

      {/* Analytics & Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Scatter Plot */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 1s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d430, #06b6d410)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} style={{ color: '#06b6d4' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Order Patterns</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Quantity vs Value scatter</p>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis type="number" dataKey="x" name="Quantity" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Value" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="z" range={[50, 200]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                <Scatter name="Orders" data={realData?.scatterData || []} fill="#06b6d4" shape="circle" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Velocity Composed Chart */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 8', animation: 'fadeInUp 0.6s ease-out 1.1s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ec489930, #ec489910)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: '#ec4899' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Supply Chain Velocity</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Demand, Supply & Flow Rate</p>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={realData?.velocityData || mockVelocityData} margin={{ top: 15, right: 15, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v > 1000 ? (v/1000).toFixed(1) + 'k' : v}`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} dx={10} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="supply" name="Supply" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar yAxisId="left" dataKey="demand" name="Demand" fill="#ec4899" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line yAxisId="right" type="monotone" dataKey="velocity" name="Velocity Rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {/* Performance Radar */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 1.2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f630, #3b82f610)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Ops Radar</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Operational efficiency indices</p>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={realData?.radarData || [
                { name: 'Accuracy', value: 92, fill: '#6366f1' },
                { name: 'Fill Rate', value: realData?.fillRate || 96, fill: '#10b981' },
                { name: 'Efficiency', value: 87, fill: '#f59e0b' },
              ]}>
                <RadialBar background dataKey="value" cornerRadius={10} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} align="right" />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 1.3s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b30, #f59e0b10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Activity</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Latest system events</p>
              </div>
            </div>
            <Link href="/orders" style={{ fontSize: '0.75rem', color: '#6366f1', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', paddingRight: '4px' }}>
            {activities.map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 4', animation: 'fadeInUp 0.6s ease-out 1.4s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b98130, #10b98110)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quick Actions</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Fast navigation links</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1.5rem' }}>
            <Link href="/upload" className="btn-modern btn-primary-modern" style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}>
              <FileSpreadsheet size={18} />
              Upload New Data
              <ArrowUpRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
            <Link href="/orders" className="btn-modern btn-secondary-modern" style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px' }}>
              <BarChart3 size={18} />
              View Orders Database
              <ArrowUpRight size={16} style={{ marginLeft: 'auto' }} />
            </Link>
            <Link href="/ai-assistant" className="btn-modern btn-secondary-modern" style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '12px 16px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <Sparkles size={18} style={{ color: '#8b5cf6' }} />
              <span style={{ color: '#f8fafc' }}>Ask AI Assistant</span>
              <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: '#a5b4fc' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Deep Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Supplier Performance Spider Chart */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 6', animation: 'fadeInUp 0.6s ease-out 1.5s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf630, #8b5cf610)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Supplier Competency Matrix</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Multi-dimensional assessment (Spider Chart)</p>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Tier 1 Suppliers" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Radar name="Tier 2 Suppliers" dataKey="B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Forecasting Mini-Widget */}
        <div className="chart-container-modern" style={{ gridColumn: 'span 6', animation: 'fadeInUp 0.6s ease-out 1.6s both', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #ec489930, #ec489910)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} style={{ color: '#ec4899' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Predictive Demand Alerts</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>AI-driven forecast indicators</p>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Forecast Item 1 */}
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid #10b981', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Summer Collection Surge</span>
                <span style={{ background: '#10b98120', color: '#34d399', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>+45% Expected</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                Historical patterns suggest a sharp upward trend for lightweight materials in the next 3 weeks. Procurement advised to increase safety stock by 15%.
              </p>
            </div>

            {/* Forecast Item 2 */}
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Legacy Components Drop</span>
                <span style={{ background: '#ef444420', color: '#f87171', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>-20% Expected</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                Demand for M2001 series is rapidly declining. Recommend pausing reorders to prevent dead stock accumulation in Q3.
              </p>
            </div>

            {/* AI Summary CTA */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Generated by Tenchi AI</span>
              <button className="btn-modern btn-secondary-modern" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Run Full Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Milestones Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="chart-container-modern" style={{ gridColumn: 'span 12', animation: 'fadeInUp 0.6s ease-out 1.7s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b98130, #10b98110)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Q3 Strategic Milestones</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>S&OP execution timeline</p>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
              68% On Track
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', paddingTop: '1rem', paddingBottom: '1rem', overflowX: 'auto', gap: '2rem' }}>
            {/* Connecting Line */}
            <div style={{ position: 'absolute', top: '32px', left: '40px', right: '40px', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}>
              <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '3px' }} />
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, minWidth: '120px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '4px solid #0f172a', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}>
                <CheckCircle2 size={16} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Demand Consensus</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Completed: Jul 15</div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, minWidth: '120px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '4px solid #0f172a', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)' }}>
                <CheckCircle2 size={16} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Supply Planning</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Completed: Jul 28</div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, minWidth: '120px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '4px solid #0f172a', boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)', animation: 'pulse 2s infinite' }}>
                <RefreshCw size={14} style={{ animation: 'spin 3s linear infinite' }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>Executive Pre-S&OP</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>In Progress (Due: Aug 10)</div>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, minWidth: '120px', opacity: 0.5 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '4px solid #0f172a' }}>
                4
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Exec Sign-off</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Target: Aug 15</div>
              </div>
            </div>

            {/* Step 5 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, minWidth: '120px', opacity: 0.5 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '4px solid #0f172a' }}>
                5
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Q4 Final Revisions</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Target: Aug 25</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
