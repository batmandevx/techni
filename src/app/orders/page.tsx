'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Plus,
  Eye,
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { SearchBar } from '@/components/SearchBar';
import { ExportButton } from '@/components/ExportButton';
import { useToast } from '@/components/Toast';

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

type SortKey = 'orderId' | 'orderDate' | 'quantity' | 'value' | 'status' | null;
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

// Status configuration with colors
const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  CREATED: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: FileText },
  CONFIRMED: { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: CheckCircle },
  SCHEDULED: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Calendar },
  SHIPPED: { color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10', icon: Truck },
  DELIVERED: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle },
  INVOICED: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: FileText },
  PENDING: { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-500/10', icon: FileText },
};

export default function OrdersPage() {
  const { orders: rawOrders, customers, materials, refreshData } = useData();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  // Transform orders data
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

  // Refresh orders
  const refreshOrders = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
    showToast('Orders refreshed successfully!', 'success');
  };

  // Reset to page 1 whenever filter / search / sort changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortKey, sortDir]);

  // Toggle sort
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filter and sort orders
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
        if (sortKey === 'orderId') { av = a.orderId; bv = b.orderId; }
        if (sortKey === 'orderDate') { av = new Date(a.orderDate).getTime(); bv = new Date(b.orderDate).getTime(); }
        if (sortKey === 'quantity') { av = a.orderLines.reduce((s: number, l: any) => s + l.quantity, 0); bv = b.orderLines.reduce((s: number, l: any) => s + l.quantity, 0); }
        if (sortKey === 'value') { av = a.orderLines.reduce((s: number, l: any) => s + l.quantity * l.material.priceUSD, 0); bv = b.orderLines.reduce((s: number, l: any) => s + l.quantity * l.material.priceUSD, 0); }
        if (sortKey === 'status') { av = a.status; bv = b.status; }
        if (av === undefined) return 0;
        return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
      });
    }
    return result;
  }, [orders, searchTerm, statusFilter, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Status counts
  const statuses = ['ALL', ...Array.from(new Set(orders.map(o => o.status)))];
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Total pipeline value — must be before any conditional returns (hooks rule)
  const totalValue = useMemo(() => orders.reduce((sum, o) =>
    sum + o.orderLines.reduce((s: number, l: any) => s + l.quantity * (l.material?.priceUSD ?? 0), 0), 0),
  [orders]);

  // Export data
  const exportRows = filteredOrders.map(o => ({
    'Order ID': o.orderId,
    'Customer': o.customer?.name,
    'Country': o.customer?.country,
    'Status': o.status,
    'Quantity': o.orderLines?.reduce((sum: number, l: any) => sum + l.quantity, 0),
    'Total Value': o.orderLines?.reduce((sum: number, l: any) => sum + l.quantity * l.material?.priceUSD, 0),
    'Order Date': new Date(o.orderDate).toLocaleDateString(),
  }));

  // Sort icon component
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={14} className="ml-1 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp size={14} className="ml-1 text-indigo-500" />
      : <ChevronDown size={14} className="ml-1 text-indigo-500" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50"
      >
        <div className="px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent"
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-xl shadow-lg shadow-indigo-500/30">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Order Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-1.5 text-sm text-gray-500 dark:text-slate-400"
              >
                Track and manage sales orders across the supply chain
              </motion.p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={refreshOrders}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <ExportButton
                data={exportRows}
                filename="orders"
                onExport={() => showToast('Orders exported successfully!', 'success')}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 text-white transition-all shadow-lg shadow-indigo-500/30 text-sm font-medium"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">New Order</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Pipeline Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total Orders', value: orders.length.toLocaleString(), sub: 'all time', color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Pipeline Value', value: `$${totalValue >= 1000000 ? `${(totalValue / 1000000).toFixed(1)}M` : `${(totalValue / 1000).toFixed(1)}k`}`, sub: 'total value', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Filtered Results', value: filteredOrders.length.toLocaleString(), sub: 'matching', color: 'text-cyan-600 dark:text-cyan-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 px-4 py-3 flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statuses.filter(s => s !== 'ALL').map((status) => {
            const count = statusCounts[status] || 0;
            const cfg = statusConfig[status] || statusConfig.CREATED;
            const isActive = statusFilter === status;
            const Icon = cfg.icon;
            return (
              <motion.button
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStatusFilter(isActive ? 'ALL' : status)}
                className={`
                  flex items-center justify-between p-4 rounded-2xl border transition-all
                  ${isActive 
                    ? `${cfg.bg} border-current ${cfg.color}` 
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <div>
                  <span className={`text-xs font-semibold uppercase ${isActive ? cfg.color : 'text-gray-500'}`}>
                    {status}
                  </span>
                  <div className={`text-2xl font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>
                    {count}
                  </div>
                </div>
                <div className={`p-2 rounded-xl ${cfg.bg}`}>
                  <Icon size={20} className={cfg.color} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <SearchBar
            placeholder="Search orders by ID, customer, or product..."
            onSearch={setSearchTerm}
            size="md"
            className="max-w-2xl"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  {([
                    { key: 'orderId', label: 'Order ID', align: 'left' },
                    { key: null, label: 'Customer', align: 'left' },
                    { key: null, label: 'Product', align: 'left' },
                    { key: 'quantity', label: 'Quantity', align: 'right' },
                    { key: 'value', label: 'Value', align: 'right' },
                    { key: 'orderDate', label: 'Date', align: 'left' },
                    { key: 'status', label: 'Status', align: 'left' },
                    { key: null, label: 'Actions', align: 'center' },
                  ] as { key: SortKey; label: string; align: string }[]).map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key)}
                      className={`
                        px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider
                        ${col.key ? 'cursor-pointer hover:text-gray-700 dark:hover:text-slate-200' : ''}
                        ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                      `}
                    >
                      <span className="inline-flex items-center">
                        {col.label}
                        {col.key && <SortIcon col={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {pagedOrders.map((order) => {
                  const totalQty = order.orderLines?.reduce((s: number, l: any) => s + l.quantity, 0) ?? 0;
                  const totalValue = order.orderLines?.reduce((s: number, l: any) => s + l.quantity * (l.material?.priceUSD ?? 0), 0) ?? 0;
                  const cfg = statusConfig[order.status] ?? statusConfig.CREATED;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-900 dark:text-white">
                            {order.orderId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{order.customer?.name ?? 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{order.customer?.country}</div>
                      </td>
                      <td className="px-4 py-4">
                        {order.orderLines?.map((line: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-700 dark:text-slate-300">
                            {line.material?.description ?? 'Unknown Product'}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {totalQty.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-600">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 text-sm">
                          <Calendar size={14} className="text-indigo-400" />
                          {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${cfg.bg} ${cfg.color}
                        `}>
                          <cfg.icon size={12} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-indigo-500 transition-colors">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-500 max-w-sm">
                {orders.length === 0
                  ? 'Upload an Excel file to see your orders here.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredOrders.length)}</span>
                {' '}–{' '}
                <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}</span>
                {' '}of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{filteredOrders.length}</span> orders
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Page <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                </span>
                <button
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
