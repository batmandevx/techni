'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Filter, Search, Download, Plus, CheckCircle2,
  AlertCircle, Clock, X, Calendar, Truck, DollarSign,
  CreditCard, Ban, FileText, ChevronDown, ChevronUp,
  RefreshCw, Send, Printer, MoreHorizontal, BarChart3,
  PieChart, TrendingUp, Users, ArrowRight, Building2,
  Globe, Boxes, Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Types
interface OrderLine {
  sku: string;
  description: string;
  quantity: number;
  allocatedQty?: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  country: string;
  status: 'CREATED' | 'CONFIRMED' | 'ALLOCATED' | 'SHIPPED' | 'DELIVERED' | 'INVOICED' | 'CANCELLED';
  creditStatus: 'RELEASED' | 'HOLD';
  creditReleasedBy: string | null;
  creditReleasedAt: string | null;
  totalAmount: number;
  currency: string;
  requestedDeliveryDate: string;
  requiredShipDate: string;
  containerId: string | null;
  lines: OrderLine[];
  shelfLifeConstraint: number;
  allocationStatus: 'NONE' | 'PARTIAL' | 'FULL';
  blockedReason: string | null;
  invoiceStatus: 'PENDING' | 'INVOICED';
  sapOrderNumber: string | null;
  sapSyncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
  sapSyncMessage?: string;
}

// Mock order data
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    orderNumber: '4500012345',
    orderDate: '2026-03-15',
    customerId: 'CUST001',
    customerName: 'Global Distributors LLC',
    country: 'UAE',
    status: 'ALLOCATED',
    creditStatus: 'RELEASED',
    creditReleasedBy: 'Finance Manager',
    creditReleasedAt: '2026-03-15T10:30:00Z',
    totalAmount: 45000,
    currency: 'USD',
    requestedDeliveryDate: '2026-03-25',
    requiredShipDate: '2026-03-23',
    containerId: 'MSKU1234567',
    lines: [
      { sku: 'SKU-A001', description: 'Premium Coffee Candy', quantity: 5000, allocatedQty: 5000, unitPrice: 5.50 },
      { sku: 'SKU-B002', description: 'Fruit Jelly Box', quantity: 3000, allocatedQty: 3000, unitPrice: 4.20 },
    ],
    shelfLifeConstraint: 180,
    allocationStatus: 'FULL',
    blockedReason: null,
    invoiceStatus: 'PENDING',
    sapOrderNumber: '4500012345',
    sapSyncStatus: 'SYNCED',
  },
  {
    id: 'ORD-2026-002',
    orderNumber: '4500012346',
    orderDate: '2026-03-16',
    customerId: 'CUST002',
    customerName: 'EuroTrade International',
    country: 'Germany',
    status: 'CREATED',
    creditStatus: 'HOLD',
    creditReleasedBy: null,
    creditReleasedAt: null,
    totalAmount: 28500,
    currency: 'USD',
    requestedDeliveryDate: '2026-03-28',
    requiredShipDate: '2026-03-26',
    containerId: null,
    lines: [
      { sku: 'SKU-C003', description: 'Chocolate Gift Box', quantity: 2500, allocatedQty: 0, unitPrice: 8.50 },
    ],
    shelfLifeConstraint: 180,
    allocationStatus: 'NONE',
    blockedReason: 'CREDIT_HOLD',
    invoiceStatus: 'PENDING',
    sapOrderNumber: null,
    sapSyncStatus: 'PENDING',
  },
  {
    id: 'ORD-2026-003',
    orderNumber: '4500012347',
    orderDate: '2026-03-17',
    customerId: 'CUST003',
    customerName: 'Asia Pacific Foods',
    country: 'Singapore',
    status: 'CONFIRMED',
    creditStatus: 'RELEASED',
    creditReleasedBy: 'Finance Manager',
    creditReleasedAt: '2026-03-17T14:00:00Z',
    totalAmount: 62000,
    currency: 'USD',
    requestedDeliveryDate: '2026-04-02',
    requiredShipDate: '2026-03-30',
    containerId: 'HLCU9876543',
    lines: [
      { sku: 'SKU-D004', description: 'Mint Candy Bulk', quantity: 8000, allocatedQty: 4000, unitPrice: 3.20 },
      { sku: 'SKU-E005', description: 'Caramel Chews', quantity: 4000, allocatedQty: 2000, unitPrice: 4.80 },
    ],
    shelfLifeConstraint: 90,
    allocationStatus: 'PARTIAL',
    blockedReason: null,
    invoiceStatus: 'PENDING',
    sapOrderNumber: '4500012347',
    sapSyncStatus: 'SYNCED',
  },
  {
    id: 'ORD-2026-004',
    orderNumber: '4500012348',
    orderDate: '2026-03-18',
    customerId: 'CUST004',
    customerName: 'Saudi Snack Distribution',
    country: 'Saudi Arabia',
    status: 'SHIPPED',
    creditStatus: 'RELEASED',
    creditReleasedBy: 'Finance Manager',
    creditReleasedAt: '2026-03-18T09:00:00Z',
    totalAmount: 38000,
    currency: 'USD',
    requestedDeliveryDate: '2026-03-25',
    requiredShipDate: '2026-03-22',
    containerId: 'OOLU4567890',
    lines: [
      { sku: 'SKU-F006', description: 'Energy Candy', quantity: 6000, allocatedQty: 6000, unitPrice: 4.50 },
    ],
    shelfLifeConstraint: 180,
    allocationStatus: 'FULL',
    blockedReason: null,
    invoiceStatus: 'INVOICED',
    sapOrderNumber: '4500012348',
    sapSyncStatus: 'SYNCED',
  },
  {
    id: 'ORD-2026-005',
    orderNumber: '4500012349',
    orderDate: '2026-03-19',
    customerId: 'CUST005',
    customerName: 'Premium Retailers Inc',
    country: 'USA',
    status: 'CREATED',
    creditStatus: 'RELEASED',
    creditReleasedBy: 'Finance Manager',
    creditReleasedAt: '2026-03-19T11:00:00Z',
    totalAmount: 75000,
    currency: 'USD',
    requestedDeliveryDate: '2026-04-05',
    requiredShipDate: '2026-04-02',
    containerId: null,
    lines: [
      { sku: 'SKU-A001', description: 'Premium Coffee Candy', quantity: 8000, allocatedQty: 0, unitPrice: 5.50 },
      { sku: 'SKU-G007', description: 'Gummy Bears', quantity: 5000, allocatedQty: 0, unitPrice: 3.80 },
    ],
    shelfLifeConstraint: 180,
    allocationStatus: 'NONE',
    blockedReason: 'STOCK_SHORTAGE',
    invoiceStatus: 'PENDING',
    sapOrderNumber: null,
    sapSyncStatus: 'FAILED',
    sapSyncMessage: 'Connection timeout to SAP',
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  CREATED: { label: 'Created', color: 'text-slate-300', bg: 'bg-slate-700/50', icon: FileText },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-300', bg: 'bg-blue-500/15', icon: CheckCircle2 },
  ALLOCATED: { label: 'Allocated', color: 'text-indigo-300', bg: 'bg-indigo-500/15', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'text-amber-300', bg: 'bg-amber-500/15', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-300', bg: 'bg-emerald-500/15', icon: CheckCircle2 },
  INVOICED: { label: 'Invoiced', color: 'text-violet-300', bg: 'bg-violet-500/15', icon: DollarSign },
  CANCELLED: { label: 'Cancelled', color: 'text-rose-300', bg: 'bg-rose-500/15', icon: X },
};

const BLOCK_REASONS: Record<string, string> = {
  CREDIT_HOLD: 'Credit not released by Finance',
  STOCK_SHORTAGE: 'Insufficient stock available',
  SHELF_LIFE: 'Stock exceeds shelf life constraint',
  RSD_CONFLICT: 'Required ship date not feasible',
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color, trend, delay = 0 }: any) {
  const colorMap: Record<string, string> = {
    blue: 'from-indigo-500 to-violet-600',
    rose: 'from-rose-500 to-pink-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${colorMap[color] || colorMap.blue}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          <TrendingUp className={`w-3 h-3 ${trend <= 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(trend)}%</span>
          <span className="text-slate-600">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── SAP Sync Modal ────────────────────────────────────────────────────────────
function SAPSyncModal({
  isOpen,
  onClose,
  order,
  onSync
}: {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSync: (orderId: string) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  useEffect(() => {
    if (isOpen) setSyncResult(null);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1;
    if (success) {
      const sapOrderNum = `45${Math.floor(10000000 + Math.random() * 90000000)}`;
      setSyncResult({ success: true, message: 'Order successfully created in SAP', orderNumber: sapOrderNum });
      onSync(order.id);
      toast.success(`Order synced to SAP: ${sapOrderNum}`);
    } else {
      setSyncResult({ success: false, message: 'BAPI_SALESORDER_CREATEFROMDAT2 failed: Credit check error' });
      toast.error('SAP sync failed: Credit check error');
    }
    setSyncing(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">SAP Integration</h3>
                  <p className="text-blue-100 text-xs">Sync order to SAP S/4HANA</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-500">Order</p>
              <p className="font-semibold text-white text-sm">{order.orderNumber}</p>
              <p className="text-xs text-slate-400">{order.customerName}</p>
            </div>

            {syncResult ? (
              <div className={`p-4 rounded-xl ${syncResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span className={`text-sm font-medium ${syncResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{syncResult.message}</p>
                {syncResult.orderNumber && (
                  <p className="text-xs font-mono mt-2 text-emerald-400">SAP Order: {syncResult.orderNumber}</p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  This will call BAPI_SALESORDER_CREATEFROMDAT2 to create the order in SAP.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors">
                Close
              </button>
              {!syncResult && (
                <button onClick={handleSync} disabled={syncing} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {syncing ? <><Loader2 className="w-4 h-4 animate-spin" />Syncing...</> : <><RefreshCw className="w-4 h-4" />Sync to SAP</>}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [creditFilter, setCreditFilter] = useState('All');
  const [sapFilter, setSapFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      const matchesCredit = creditFilter === 'All' || order.creditStatus === creditFilter;
      const matchesSAP = sapFilter === 'All' || order.sapSyncStatus === sapFilter;
      return matchesSearch && matchesStatus && matchesCredit && matchesSAP;
    });
  }, [orders, searchTerm, statusFilter, creditFilter, sapFilter]);

  const kpis = useMemo(() => ({
    total: orders.length,
    totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    blocked: orders.filter(o => o.blockedReason).length,
    allocated: orders.filter(o => o.allocationStatus === 'FULL').length,
    pendingCredit: orders.filter(o => o.creditStatus === 'HOLD').length,
    invoiced: orders.filter(o => o.invoiceStatus === 'INVOICED').length,
    sapSynced: orders.filter(o => o.sapSyncStatus === 'SYNCED').length,
    sapFailed: orders.filter(o => o.sapSyncStatus === 'FAILED').length,
  }), [orders]);

  const handleReleaseCredit = (orderId: string) => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setOrders(prev => prev.map(o =>
            o.id === orderId
              ? { ...o, creditStatus: 'RELEASED' as const, creditReleasedBy: 'Finance Manager', creditReleasedAt: new Date().toISOString() }
              : o
          ));
          resolve(true);
        }, 1000);
      }),
      { loading: 'Releasing credit hold...', success: 'Credit released successfully', error: 'Failed to release credit' }
    );
  };

  const handleSyncToSAP = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, sapSyncStatus: 'SYNCED' as const, sapOrderNumber: `45${Math.floor(10000000 + Math.random() * 90000000)}` }
        : o
    ));
  };

  const handleExport = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Country', 'Status', 'Credit Status', 'Allocation', 'Total Amount', 'SAP Status'].join(','),
      ...filteredOrders.map(o => [
        o.orderNumber, o.customerName, o.country, o.status, o.creditStatus, o.allocationStatus, o.totalAmount, o.sapSyncStatus
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported to CSV');
  };

  return (
    <div className="min-h-screen p-5 lg:p-7"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1528 50%, #0a1520 100%)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <Package className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Order Management</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Orders</h1>
            <p className="text-sm text-slate-500 mt-0.5">Allocation - Credit release - SAP integration</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
              <Plus className="w-3.5 h-3.5" /> New Order
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Orders" value={kpis.total} subtitle={`$${(kpis.totalValue / 1000).toFixed(1)}k value`} icon={Package} color="blue" trend={12} delay={0} />
        <KPICard title="Blocked" value={kpis.blocked} subtitle="Needs attention" icon={Ban} color="rose" delay={0.05} />
        <KPICard title="SAP Synced" value={kpis.sapSynced} subtitle={`${kpis.sapFailed} failed`} icon={Building2} color="emerald" trend={8} delay={0.1} />
        <KPICard title="Pending Credit" value={kpis.pendingCredit} subtitle="Awaiting release" icon={CreditCard} color="amber" delay={0.15} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search order number, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        {[
          { val: statusFilter, set: setStatusFilter, opts: ['All', 'CREATED', 'CONFIRMED', 'ALLOCATED', 'SHIPPED', 'INVOICED'], placeholder: 'Status' },
          { val: creditFilter, set: setCreditFilter, opts: ['All', 'RELEASED', 'HOLD'], placeholder: 'Credit' },
          { val: sapFilter, set: setSapFilter, opts: ['All', 'SYNCED', 'PENDING', 'FAILED'], placeholder: 'SAP' },
        ].map(({ val, set, opts, placeholder }) => (
          <select
            key={placeholder}
            value={val}
            onChange={(e) => set(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm text-slate-300 outline-none focus:border-indigo-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {opts.map(o => <option key={o} value={o} style={{ background: '#1e293b' }}>{o === 'All' ? `All ${placeholder}` : o}</option>)}
          </select>
        ))}
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Total Row */}
        <div className="border-b border-indigo-500/20 px-4 py-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-indigo-400">TOTAL ({filteredOrders.length} orders)</span>
            <span className="font-bold text-white">${kpis.totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">RSD</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Credit</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SAP</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.CREATED;
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={order.id}
                    className="border-t border-white/5 hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono font-medium text-white text-xs">{order.orderNumber}</p>
                        <p className="text-[10px] text-slate-600">{order.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-200 text-xs font-medium">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500">{order.country}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.requiredShipDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white text-xs">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.creditStatus === 'RELEASED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Released
                        </span>
                      ) : (
                        <button onClick={() => handleReleaseCredit(order.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-medium border border-rose-500/20 hover:bg-rose-500/25 transition-colors">
                          <Ban className="w-2.5 h-2.5" /> Hold
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.sapSyncStatus === 'SYNCED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                          <Building2 className="w-2.5 h-2.5" /> {order.sapOrderNumber?.slice(-6)}
                        </span>
                      ) : order.sapSyncStatus === 'FAILED' ? (
                        <button onClick={() => { setSelectedOrder(order); setShowSAPModal(true); }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-medium border border-rose-500/20 hover:bg-rose-500/25 transition-colors">
                          <AlertCircle className="w-2.5 h-2.5" /> Failed
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedOrder(order); setShowSAPModal(true); }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/15 text-slate-400 text-[10px] font-medium border border-slate-500/20 hover:bg-slate-500/25 transition-colors">
                          <Clock className="w-2.5 h-2.5" /> Pending
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {order.allocationStatus !== 'FULL' && order.creditStatus === 'RELEASED' && (
                          <button className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium rounded-lg transition-all">
                            Allocate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <SAPSyncModal isOpen={showSAPModal} onClose={() => setShowSAPModal(false)} order={selectedOrder} onSync={handleSyncToSAP} />
    </div>
  );
}
