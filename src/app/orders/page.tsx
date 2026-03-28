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

// Mock order data with comprehensive fields
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
  CREATED:   { label: 'Created',   color: 'text-slate-300',   bg: 'bg-slate-700/50',    icon: FileText },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-300',    bg: 'bg-blue-500/15',     icon: CheckCircle2 },
  ALLOCATED: { label: 'Allocated', color: 'text-indigo-300',  bg: 'bg-indigo-500/15',   icon: Package },
  SHIPPED:   { label: 'Shipped',   color: 'text-amber-300',   bg: 'bg-amber-500/15',    icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-300', bg: 'bg-emerald-500/15',  icon: CheckCircle2 },
  INVOICED:  { label: 'Invoiced',  color: 'text-violet-300',  bg: 'bg-violet-500/15',   icon: DollarSign },
  CANCELLED: { label: 'Cancelled', color: 'text-rose-300',    bg: 'bg-rose-500/15',     icon: X },
};

const BLOCK_REASONS: Record<string, string> = {
  CREDIT_HOLD: 'Credit not released by Finance',
  STOCK_SHORTAGE: 'Insufficient stock available',
  SHELF_LIFE: 'Stock exceeds shelf life constraint',
  RSD_CONFLICT: 'Required ship date not feasible',
};

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend, loading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative rounded-2xl p-5 overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-white/5 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        )}
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color} shadow-lg flex-shrink-0`}>
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

// SAP Integration Modal Component
const SAPSyncModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onSync 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  order: Order | null;
  onSync: (orderId: string) => void;
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSync = async () => {
    setSyncing(true);
    // Simulate SAP BAPI call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% success rate simulation
    const success = Math.random() > 0.1;
    if (success) {
      const sapOrderNum = `45${Math.floor(10000000 + Math.random() * 90000000)}`;
      setSyncResult({ 
        success: true, 
        message: 'Order successfully created in SAP',
        orderNumber: sapOrderNum
      });
      onSync(order.id);
      toast.success(`Order synced to SAP: ${sapOrderNum}`);
    } else {
      setSyncResult({ 
        success: false, 
        message: 'BAPI_SALESORDER_CREATEFROMDAT2 failed: Credit check error' 
      });
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">SAP Integration</h3>
                  <p className="text-blue-100 text-sm">Sync order to SAP S/4HANA</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <p className="text-sm text-gray-500">Order</p>
              <p className="font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
            </div>

            {syncResult ? (
              <div className={`p-4 rounded-xl ${syncResult.success ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {syncResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className={`font-medium ${syncResult.success ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{syncResult.message}</p>
                {syncResult.orderNumber && (
                  <p className="text-sm font-mono mt-2 text-emerald-600">SAP Order: {syncResult.orderNumber}</p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This will call BAPI_SALESORDER_CREATEFROMDAT2 to create the order in SAP.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              {!syncResult && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sync to SAP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// New Order Modal
const NewOrderModal = ({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (order: Partial<Order>) => void;
}) => {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    country: '',
    requiredShipDate: '',
    requestedDeliveryDate: '',
    lines: [{ sku: '', description: '', quantity: 0, unitPrice: 0 }],
  });

  if (!isOpen) return null;

  const handleCreate = async () => {
    setCreating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onCreate(formData);
    setCreating(false);
    setStep(1);
    onClose();
    toast.success('Order created successfully');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">New Order</h3>
                  <p className="text-emerald-100 text-sm">Step {step} of 2</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <option value="">Select country</option>
                      <option value="UAE">UAE</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Germany">Germany</option>
                      <option value="Singapore">Singapore</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Ship Date</label>
                    <input
                      type="date"
                      value={formData.requiredShipDate}
                      onChange={(e) => setFormData({ ...formData, requiredShipDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requested Delivery Date</label>
                    <input
                      type="date"
                      value={formData.requestedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  {formData.lines.map((line, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">SKU</label>
                          <input
                            type="text"
                            value={line.sku}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].sku = e.target.value;
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                            placeholder="SKU code"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].description = e.target.value;
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                            placeholder="Product description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty</label>
                            <input
                              type="number"
                              value={line.quantity}
                              onChange={(e) => {
                                const newLines = [...formData.lines];
                                newLines[idx].quantity = parseInt(e.target.value) || 0;
                                setFormData({ ...formData, lines: newLines });
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Price</label>
                            <input
                              type="number"
                              value={line.unitPrice}
                              onChange={(e) => {
                                const newLines = [...formData.lines];
                                newLines[idx].unitPrice = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, lines: newLines });
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, lines: [...formData.lines, { sku: '', description: '', quantity: 0, unitPrice: 0 }] })}
                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    + Add Line Item
                  </button>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={creating}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Create Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [creditFilter, setCreditFilter] = useState('All');
  const [sapFilter, setSapFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'allocation' | 'reports'>('orders');
  const [showSAPModal, setShowSAPModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(false);

  // Filter orders
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

  // Calculate KPIs
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

  // Customer breakdown for reports
  const customerBreakdown = useMemo(() => {
    const breakdown: Record<string, { 
      customerName: string; 
      total: number; 
      blocked: number; 
      allocated: number; 
      invoiced: number;
      totalValue: number;
    }> = {};
    
    orders.forEach(order => {
      if (!breakdown[order.customerId]) {
        breakdown[order.customerId] = {
          customerName: order.customerName,
          total: 0,
          blocked: 0,
          allocated: 0,
          invoiced: 0,
          totalValue: 0,
        };
      }
      breakdown[order.customerId].total++;
      breakdown[order.customerId].totalValue += order.totalAmount;
      if (order.blockedReason) breakdown[order.customerId].blocked++;
      if (order.allocationStatus === 'FULL') breakdown[order.customerId].allocated++;
      if (order.invoiceStatus === 'INVOICED') breakdown[order.customerId].invoiced++;
    });
    
    return Object.entries(breakdown).map(([id, data]) => ({ id, ...data }));
  }, [orders]);

  const handleAllocate = (orderId: string) => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setOrders(prev => prev.map(o => 
            o.id === orderId 
              ? { ...o, allocationStatus: 'FULL' as const, status: 'ALLOCATED' as const }
              : o
          ));
          resolve(true);
        }, 1500);
      }),
      {
        loading: 'Allocating inventory...',
        success: 'Inventory allocated successfully',
        error: 'Allocation failed',
      }
    );
    setShowAllocationModal(false);
  };

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
      {
        loading: 'Releasing credit hold...',
        success: 'Credit released successfully',
        error: 'Failed to release credit',
      }
    );
  };

  const handleSyncToSAP = (orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, sapSyncStatus: 'SYNCED' as const, sapOrderNumber: `45${Math.floor(10000000 + Math.random() * 90000000)}` }
        : o
    ));
  };

  const handleCreateOrder = (formData: Partial<Order>) => {
    const newOrder: Order = {
      id: `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`,
      orderNumber: `45${Math.floor(10000000 + Math.random() * 90000000)}`,
      orderDate: new Date().toISOString().split('T')[0],
      customerId: `CUST${String(orders.length + 1).padStart(3, '0')}`,
      customerName: formData.customerName || 'New Customer',
      country: formData.country || 'UAE',
      status: 'CREATED',
      creditStatus: 'HOLD',
      creditReleasedBy: null,
      creditReleasedAt: null,
      totalAmount: formData.lines?.reduce((sum, l) => sum + (l.quantity * l.unitPrice), 0) || 0,
      currency: 'USD',
      requestedDeliveryDate: formData.requestedDeliveryDate || '',
      requiredShipDate: formData.requiredShipDate || '',
      containerId: null,
      lines: formData.lines || [],
      shelfLifeConstraint: 180,
      allocationStatus: 'NONE',
      blockedReason: 'CREDIT_HOLD',
      invoiceStatus: 'PENDING',
      sapOrderNumber: null,
      sapSyncStatus: 'PENDING',
    };
    setOrders([newOrder, ...orders]);
  };

  const handleExport = () => {
    const csvContent = [
      ['Order Number', 'Customer', 'Country', 'Status', 'Credit Status', 'Allocation', 'Total Amount', 'SAP Status'].join(','),
      ...filteredOrders.map(o => [
        o.orderNumber,
        o.customerName,
        o.country,
        o.status,
        o.creditStatus,
        o.allocationStatus,
        o.totalAmount,
        o.sapSyncStatus,
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
            <p className="text-sm text-slate-500 mt-0.5">Allocation · Credit release · SAP integration</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Order
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Orders" value={kpis.total} subtitle={`$${(kpis.totalValue / 1000).toFixed(1)}k value`} icon={Package} color="bg-blue-500" trend={12} />
        <KPICard title="Blocked" value={kpis.blocked} subtitle="Needs attention" icon={Ban} color="bg-rose-500" />
        <KPICard title="SAP Synced" value={kpis.sapSynced} subtitle={`${kpis.sapFailed} failed`} icon={Building2} color="bg-indigo-500" trend={8} />
        <KPICard title="Pending Credit" value={kpis.pendingCredit} subtitle="Awaiting release" icon={CreditCard} color="bg-amber-500" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key: 'orders', label: 'Orders', icon: Package },
          { key: 'allocation', label: 'Allocation Queue', icon: RefreshCw },
          { key: 'reports', label: 'Reports', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
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
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
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
                      <motion.tr key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                            <button onClick={() => handleReleaseCredit(order.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-medium border border-rose-500/20 hover:bg-rose-500/25 transition-colors">
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
                            <button onClick={() => { setSelectedOrder(order); setShowSAPModal(true); }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-medium border border-rose-500/20 hover:bg-rose-500/25 transition-colors"
                              title={order.sapSyncMessage}>
                              <AlertCircle className="w-2.5 h-2.5" /> Failed
                            </button>
                          ) : (
                            <button onClick={() => { setSelectedOrder(order); setShowSAPModal(true); }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/15 text-slate-400 text-[10px] font-medium border border-slate-500/20 hover:bg-slate-500/25 transition-colors">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${status.bg} ${status.color}`}
                            style={{ borderColor: 'transparent' }}>
                            <StatusIcon className="w-2.5 h-2.5" /> {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedOrder(order)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            {order.allocationStatus !== 'FULL' && order.creditStatus === 'RELEASED' && (
                              <button onClick={() => { setSelectedOrder(order); setShowAllocationModal(true); }}
                                className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium rounded-lg transition-all">
                                Allocate
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Allocation Queue Tab */}
      {activeTab === 'allocation' && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 className="font-semibold text-amber-300 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              Allocation Rules
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-amber-400/70">
              <li>• Allocation based on Required Shipment Date (RSD) — First Required First Out (FRFO)</li>
              <li>• Orders on credit hold cannot be allocated</li>
              <li>• Shelf life constraints: Customers will not receive stock older than 6 months (configurable)</li>
              <li>• Blocked orders must be resolved before allocation</li>
            </ul>
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-semibold text-white text-sm mb-4">Pending Allocations ({orders.filter(o => o.allocationStatus !== 'FULL').length})</h3>
            <div className="space-y-2">
              {orders.filter(o => o.allocationStatus !== 'FULL').map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      order.blockedReason ? 'bg-rose-500/15' : 'bg-amber-500/15'
                    }`}>
                      {order.blockedReason ? <Ban className="w-4 h-4 text-rose-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white text-xs font-mono">{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-500">{order.customerName} · RSD: {new Date(order.requiredShipDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.blockedReason && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg">
                        {BLOCK_REASONS[order.blockedReason]}
                      </span>
                    )}
                    <button
                      onClick={() => handleAllocate(order.id)}
                      disabled={!!order.blockedReason}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                      style={{
                        background: order.blockedReason ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.2)',
                        border: order.blockedReason ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(99,102,241,0.3)',
                        color: order.blockedReason ? '#475569' : '#a5b4fc',
                      }}
                    >
                      Allocate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.total}</p>
              <p className="text-sm text-gray-400 mt-1">${kpis.totalValue.toLocaleString()} total value</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Blocked Orders</h3>
              <p className="text-3xl font-bold text-rose-600">{kpis.blocked}</p>
              <p className="text-sm text-gray-400 mt-1">Requiring attention</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-2">SAP Sync Rate</h3>
              <p className="text-3xl font-bold text-indigo-600">{Math.round((kpis.sapSynced / kpis.total) * 100)}%</p>
              <p className="text-sm text-gray-400 mt-1">{kpis.sapSynced} of {kpis.total} orders synced</p>
            </div>
          </div>

          {/* Customer Breakdown Table */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Order Breakup by Customer</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Total Orders</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Blocked</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Allocated</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Invoiced</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Total Row */}
                <tr className="bg-indigo-50/50 dark:bg-indigo-500/10 border-b border-gray-200 dark:border-slate-700">
                  <td className="px-4 py-3 font-semibold text-indigo-700 dark:text-indigo-400">TOTAL</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">{kpis.total}</td>
                  <td className="px-4 py-3 text-center font-bold text-rose-600">{kpis.blocked}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-600">{kpis.allocated}</td>
                  <td className="px-4 py-3 text-center font-bold text-violet-600">{kpis.invoiced}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">${kpis.totalValue.toLocaleString()}</td>
                </tr>
                {customerBreakdown.map((customer) => (
                  <tr key={customer.id} className="border-t border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{customer.customerName}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{customer.total}</td>
                    <td className="px-4 py-3 text-center">
                      {customer.blocked > 0 ? (
                        <span className="text-rose-600 font-medium">{customer.blocked}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {customer.allocated > 0 ? (
                        <span className="text-emerald-600 font-medium">{customer.allocated}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {customer.invoiced > 0 ? (
                        <span className="text-violet-600 font-medium">{customer.invoiced}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">${customer.totalValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && !showSAPModal && !showAllocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onMouseDown={(e) => e.target === e.currentTarget && setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-violet-600 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedOrder.orderNumber}</h2>
                    <p className="text-indigo-100">{selectedOrder.customerName} • {selectedOrder.country}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-500">RSD</p>
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedOrder.requiredShipDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">${selectedOrder.totalAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* SAP Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">SAP Integration</h3>
                  <div className={`p-3 rounded-lg ${
                    selectedOrder.sapSyncStatus === 'SYNCED' ? 'bg-blue-50 dark:bg-blue-500/10' : 
                    selectedOrder.sapSyncStatus === 'FAILED' ? 'bg-rose-50 dark:bg-rose-500/10' :
                    'bg-gray-50 dark:bg-slate-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-5 h-5 ${
                          selectedOrder.sapSyncStatus === 'SYNCED' ? 'text-blue-600' : 
                          selectedOrder.sapSyncStatus === 'FAILED' ? 'text-rose-600' :
                          'text-gray-400'
                        }`} />
                        <span className={
                          selectedOrder.sapSyncStatus === 'SYNCED' ? 'text-blue-700 dark:text-blue-400' : 
                          selectedOrder.sapSyncStatus === 'FAILED' ? 'text-rose-700 dark:text-rose-400' :
                          'text-gray-600 dark:text-gray-400'
                        }>
                          {selectedOrder.sapSyncStatus === 'SYNCED' ? 'Synced to SAP' : 
                           selectedOrder.sapSyncStatus === 'FAILED' ? 'Sync Failed' :
                           'Pending Sync'}
                        </span>
                      </div>
                      {selectedOrder.sapOrderNumber && (
                        <span className="text-sm font-mono text-blue-600">{selectedOrder.sapOrderNumber}</span>
                      )}
                    </div>
                    {selectedOrder.sapSyncMessage && (
                      <p className="text-xs text-rose-600 mt-1">{selectedOrder.sapSyncMessage}</p>
                    )}
                    {selectedOrder.sapSyncStatus !== 'SYNCED' && (
                      <button
                        onClick={() => setShowSAPModal(true)}
                        className="mt-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Sync to SAP
                      </button>
                    )}
                  </div>
                </div>

                {/* Credit Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Credit Status</h3>
                  <div className={`p-3 rounded-lg ${selectedOrder.creditStatus === 'RELEASED' ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
                    <div className="flex items-center gap-2">
                      {selectedOrder.creditStatus === 'RELEASED' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Ban className="w-5 h-5 text-rose-600" />
                      )}
                      <span className={selectedOrder.creditStatus === 'RELEASED' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {selectedOrder.creditStatus === 'RELEASED' ? 'Credit Released' : 'Credit Hold'}
                      </span>
                    </div>
                    {selectedOrder.creditReleasedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Released by {selectedOrder.creditReleasedBy} on {new Date(selectedOrder.creditReleasedAt!).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Line Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.lines.map((line: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{line.sku}</p>
                            <p className="text-xs text-gray-500">{line.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{line.quantity.toLocaleString()} units</p>
                          <p className="text-xs text-gray-500">${line.unitPrice.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  {selectedOrder.allocationStatus !== 'FULL' && selectedOrder.creditStatus === 'RELEASED' && (
                    <button 
                      onClick={() => setShowAllocationModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
                    >
                      <Boxes className="w-4 h-4" />
                      Allocate Inventory
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAP Sync Modal */}
      <SAPSyncModal 
        isOpen={showSAPModal} 
        onClose={() => setShowSAPModal(false)} 
        order={selectedOrder}
        onSync={handleSyncToSAP}
      />

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onCreate={handleCreateOrder}
      />
    </div>
  );
}
