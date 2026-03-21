'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  CheckCircle,
  Truck,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  status: string;
  customer: {
    name: string;
    country: string;
  };
  orderLines: {
    quantity: number;
    material: {
      description: string;
      priceUSD: number;
    };
  }[];
}

import { useData } from '@/lib/DataContext';
import { OrderModal } from '@/components/OrderModal';
import { ExportButton } from '@/components/ExportButton';
import { useToast } from '@/components/Toast';

type SortKey = 'orderId' | 'orderDate' | 'quantity' | 'value' | 'status' | null;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

// Uses HSL-based colours that work on both light and dark glassy backgrounds.
const statusConfig: Record<string, { hue: number; icon: React.ElementType }> = {
  CREATED:         { hue: 220, icon: FileText },
  CONFIRMED:       { hue: 217, icon: CheckCircle },
  SCHEDULED:       { hue:  38, icon: Calendar },
  SHIPPED:         { hue: 189, icon: Truck },
  DELIVERED:       { hue: 160, icon: CheckCircle },
  INVOICED:        { hue: 262, icon: FileText },
  CONFIRMED_EXCEL: { hue: 160, icon: CheckCircle },
};

function statusStyle(hue: number, active = false) {
  return {
    backgroundColor: `hsla(${hue}, 70%, 60%, ${active ? 0.9 : 0.18})`,
    color: active ? '#fff' : `hsl(${hue}, 80%, 75%)`,
    border: `1px solid hsla(${hue}, 70%, 60%, 0.45)`,
  };
}

function statusDot(hue: number) {
  return { backgroundColor: `hsl(${hue}, 70%, 60%)` };
}

export default function OrdersPage() {
  const { orders: rawOrders, customers, materials } = useData();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  const orders = useMemo(() => {
    return rawOrders.map((o: any) => {
      const customer = customers.find((c: any) => c.id === o.customerId) || { name: 'Unknown', country: 'Unknown' };
      const material = materials.find((m: any) => m.id === o.materialId) || { description: 'Unknown', priceUSD: 0 };
      return {
        id: o.orderId || Math.random().toString(),
        orderId: o.orderId || o.id,
        orderDate: o.orderDate || new Date().toISOString(),
        status: (o.status || 'CONFIRMED').toUpperCase(),
        customer,
        orderLines: [{ quantity: o.quantity || 0, material }],
      };
    });
  }, [rawOrders, customers, materials]);

  const refreshOrders = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    window.addEventListener('dashboard-refresh', refreshOrders);
    return () => window.removeEventListener('dashboard-refresh', refreshOrders);
  }, []);

  // Reset to page 1 whenever filter / search / sort changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderLines?.some((l: any) =>
          l.material?.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let av: any, bv: any;
        if (sortKey === 'orderId')    { av = a.orderId;   bv = b.orderId; }
        if (sortKey === 'orderDate')  { av = new Date(a.orderDate).getTime(); bv = new Date(b.orderDate).getTime(); }
        if (sortKey === 'quantity')   { av = a.orderLines.reduce((s: number, l: any) => s + l.quantity, 0); bv = b.orderLines.reduce((s: number, l: any) => s + l.quantity, 0); }
        if (sortKey === 'value')      { av = a.orderLines.reduce((s: number, l: any) => s + l.quantity * l.material.priceUSD, 0); bv = b.orderLines.reduce((s: number, l: any) => s + l.quantity * l.material.priceUSD, 0); }
        if (sortKey === 'status')     { av = a.status;    bv = b.status; }
        if (av === undefined) return 0;
        return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
      });
    }
    return result;
  }, [orders, searchTerm, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statuses = ['ALL', ...Array.from(new Set(orders.map(o => o.status)))];

  const exportRows = filteredOrders.map(o => ({
    'Order ID': o.orderId,
    'Customer': o.customer?.name,
    'Country': o.customer?.country,
    'Status': o.status,
    'Quantity': o.orderLines?.reduce((sum: number, l: any) => sum + l.quantity, 0),
    'Total Value': o.orderLines?.reduce((sum: number, l: any) => sum + l.quantity * l.material?.priceUSD, 0),
    'Order Date': new Date(o.orderDate).toLocaleDateString(),
  }));

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={14} className="ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={14} className="ml-1 text-indigo-400" />
      : <ChevronDown size={14} className="ml-1 text-indigo-400" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <RefreshCw size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h1
            className="gradient-heading"
            style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem',
              background: 'linear-gradient(90deg, #f8fafc, #a5b4fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Order Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Track and manage sales orders across the supply chain
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={refreshOrders} className="btn-modern btn-secondary-modern hover-lift">
            <RefreshCw size={18} />
            Refresh
          </button>
          {/* Wired Export button */}
          <ExportButton
            data={exportRows}
            filename="orders"
            onExport={() => showToast('Orders exported successfully!', 'success')}
          />
        </div>
      </div>

      {/* Status KPI Cards */}
      <div className="grid-kpi" style={{ marginBottom: '2rem' }}>
        {statuses.filter(s => s !== 'ALL').map((status) => {
          const count = orders.filter(o => o.status === status).length;
          const cfg = statusConfig[status] || statusConfig.CREATED;
          const isActive = statusFilter === status;
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? 'ALL' : status)}
              className="card-modern hover-lift"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', cursor: 'pointer', textAlign: 'left',
                border: isActive ? `1px solid hsl(${cfg.hue},70%,60%)` : undefined,
                boxShadow: isActive ? `0 0 20px hsla(${cfg.hue},70%,60%,0.25)` : undefined,
              }}
            >
              <div>
                <span
                  className="badge-modern"
                  style={{ ...statusStyle(cfg.hue, isActive), marginBottom: '0.5rem', display: 'inline-block' }}
                >
                  {status.toLowerCase()}
                </span>
                <div className="text-slate-100" style={{ fontSize: '2rem', fontWeight: 800 }}>{count}</div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, hsla(${cfg.hue},70%,60%,0.35), hsla(${cfg.hue},70%,60%,0.1))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={24} style={{ color: `hsl(${cfg.hue},70%,70%)` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter bar */}
      <div
        className="card-modern"
        style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1rem 1.5rem',
          alignItems: 'center', flexWrap: 'wrap' }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID, customer, or product..."
            className="input-modern"
            style={{ paddingLeft: '3rem' }}
          />
        </div>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-modern"
            style={{ appearance: 'none', paddingRight: '3rem', minWidth: 200, cursor: 'pointer' }}
          >
            <option value="ALL">All Status</option>
            {statuses.filter(s => s !== 'ALL').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Filter size={18} style={{ position: 'absolute', right: '1rem', top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-modern" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider"
                style={{ background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Sortable columns */}
                {([
                  { key: 'orderId',   label: 'Order ID',  align: 'left' },
                  { key: null,        label: 'Customer',  align: 'left' },
                  { key: null,        label: 'Product',   align: 'left' },
                  { key: 'quantity',  label: 'Quantity',  align: 'right' },
                  { key: 'value',     label: 'Value',     align: 'right' },
                  { key: 'orderDate', label: 'Date',      align: 'left' },
                  { key: 'status',    label: 'Status',    align: 'left' },
                ] as { key: SortKey; label: string; align: string }[]).map(col => (
                  <th
                    key={col.label}
                    onClick={() => col.key && toggleSort(col.key)}
                    style={{
                      padding: '1rem 1.5rem',
                      textAlign: col.align as any,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    className={col.key ? 'hover:text-slate-200 transition-colors' : ''}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => {
                const totalQty   = order.orderLines?.reduce((s: number, l: any) => s + l.quantity, 0) ?? 0;
                const totalValue = order.orderLines?.reduce((s: number, l: any) => s + l.quantity * (l.material?.priceUSD ?? 0), 0) ?? 0;
                const cfg = statusConfig[order.status] ?? statusConfig.CREATED;
                return (
                  <tr
                    key={order.id}
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={statusDot(cfg.hue)} />
                        <span className="font-mono font-semibold text-slate-100">{order.orderId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{order.customer?.name ?? 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{order.customer?.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.orderLines?.map((line: any, idx: number) => (
                        <div key={idx} className="text-slate-300 font-medium">
                          {line.material?.description ?? 'Unknown Product'}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-100">
                      {totalQty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: 'hsl(160,70%,60%)' }}>
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <Calendar size={14} className="text-indigo-400" />
                        {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-modern" style={statusStyle(cfg.hue)}>
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Package size={40} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">No orders found</h3>
            <p className="text-slate-400 text-lg">
              {orders.length === 0
                ? 'Upload an Excel file to see your orders here.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 text-slate-400"
          style={{ background: 'rgba(15,23,42,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-medium">
            Showing{' '}
            <span className="text-slate-100">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredOrders.length)}</span>
            {' '}–{' '}
            <span className="text-slate-100">{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span>
            {' '}of{' '}
            <span className="text-slate-100">{filteredOrders.length}</span> orders
          </span>
          <div className="flex items-center gap-3">
            <button
              className="btn-modern btn-secondary-modern"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              style={currentPage === 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              Previous
            </button>
            <span className="text-slate-300 text-sm">
              Page{' '}<span className="font-semibold text-slate-100">{currentPage}</span>{' '}of{' '}
              <span className="font-semibold text-slate-100">{totalPages}</span>
            </span>
            <button
              className="btn-modern btn-secondary-modern"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              style={currentPage === totalPages ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
