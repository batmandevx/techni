'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, MapPin, Calendar, Package, 
  ArrowRight, Search, Filter, RefreshCw, 
  Ship, Anchor, CheckCircle2, Navigation,
  Download, ExternalLink, Eye, Box
} from 'lucide-react';
import Link from 'next/link';
import MapTracking from '@/components/MapTracking';

// Mock container data
const MOCK_CONTAINERS = [
  {
    id: 'cont-001',
    containerNumber: 'MSKU1234567',
    shippingLine: 'Maersk',
    vesselName: 'Maersk Edinburgh',
    voyageNumber: 'ME123E',
    originPort: { code: 'CNSHA', name: 'Shanghai', country: 'China' },
    destinationPort: { code: 'AEDXB', name: 'Jebel Ali', country: 'UAE' },
    etd: '2026-03-15',
    eta: '2026-03-28',
    ata: null,
    status: 'IN_TRANSIT',
    trackingUrl: 'https://track.maersk.com/1234567',
    blNumber: 'MAEU123456789',
    sealNumber: 'SL123456',
    containerType: '40HQ',
    weightKg: 28500,
    volumeCbm: 68,
    orderId: 'ORD-2026-001',
    customerName: 'Global Distributors LLC',
    contents: [
      { sku: 'SKU-A001', description: 'Premium Coffee Candy', quantity: 5000 },
      { sku: 'SKU-B002', description: 'Fruit Jelly Box', quantity: 3000 },
    ],
    statusHistory: [
      { status: 'BOOKED', location: 'Shanghai', timestamp: '2026-03-10T08:00:00Z' },
      { status: 'GATE_IN', location: 'Shanghai Terminal', timestamp: '2026-03-13T14:30:00Z' },
      { status: 'LOADED', location: 'Shanghai Port', timestamp: '2026-03-14T09:15:00Z' },
      { status: 'DEPARTED', location: 'Shanghai', timestamp: '2026-03-15T16:45:00Z' },
      { status: 'IN_TRANSIT', location: 'Indian Ocean', timestamp: '2026-03-20T12:00:00Z' },
    ],
  },
  {
    id: 'cont-002',
    containerNumber: 'MSCU7654321',
    shippingLine: 'MSC',
    vesselName: 'MSC Geneva',
    voyageNumber: 'MG456G',
    originPort: { code: 'NLRTM', name: 'Rotterdam', country: 'Netherlands' },
    destinationPort: { code: 'AEDXB', name: 'Jebel Ali', country: 'UAE' },
    etd: '2026-03-18',
    eta: '2026-03-30',
    ata: null,
    status: 'ARRIVED',
    trackingUrl: 'https://track.msc.com/7654321',
    blNumber: 'MSCUE987654321',
    sealNumber: 'SL765432',
    containerType: '20GP',
    weightKg: 18500,
    volumeCbm: 32,
    orderId: 'ORD-2026-015',
    customerName: 'EuroTrade International',
    contents: [
      { sku: 'SKU-C003', description: 'Chocolate Gift Box', quantity: 2500 },
    ],
    statusHistory: [
      { status: 'BOOKED', location: 'Rotterdam', timestamp: '2026-03-12T10:00:00Z' },
      { status: 'GATE_IN', location: 'Rotterdam Terminal', timestamp: '2026-03-16T08:20:00Z' },
      { status: 'LOADED', location: 'Rotterdam Port', timestamp: '2026-03-17T11:00:00Z' },
      { status: 'DEPARTED', location: 'Rotterdam', timestamp: '2026-03-18T14:30:00Z' },
      { status: 'ARRIVED', location: 'Jebel Ali', timestamp: '2026-03-29T06:00:00Z' },
    ],
  },
  {
    id: 'cont-003',
    containerNumber: 'HLCU9876543',
    shippingLine: 'Hapag-Lloyd',
    vesselName: 'Hamburg Express',
    voyageNumber: 'HE789H',
    originPort: { code: 'SGSIN', name: 'Singapore', country: 'Singapore' },
    destinationPort: { code: 'AEDXB', name: 'Jebel Ali', country: 'UAE' },
    etd: '2026-03-22',
    eta: '2026-04-02',
    ata: null,
    status: 'LOADED',
    trackingUrl: 'https://track.hapag-lloyd.com/9876543',
    blNumber: 'HLXU456789123',
    sealNumber: 'SL987654',
    containerType: '40HQ',
    weightKg: 26500,
    volumeCbm: 65,
    orderId: 'ORD-2026-023',
    customerName: 'Asia Pacific Foods',
    contents: [
      { sku: 'SKU-D004', description: 'Mint Candy Bulk', quantity: 8000 },
      { sku: 'SKU-E005', description: 'Caramel Chews', quantity: 4000 },
    ],
    statusHistory: [
      { status: 'BOOKED', location: 'Singapore', timestamp: '2026-03-18T09:00:00Z' },
      { status: 'GATE_IN', location: 'Singapore Terminal', timestamp: '2026-03-20T16:45:00Z' },
      { status: 'LOADED', location: 'Singapore Port', timestamp: '2026-03-21T08:30:00Z' },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  BOOKED: { label: 'Booked', color: 'text-gray-600', bg: 'bg-gray-100', icon: Box },
  GATE_IN: { label: 'Gate In', color: 'text-blue-600', bg: 'bg-blue-100', icon: Package },
  LOADED: { label: 'Loaded', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Box },
  DEPARTED: { label: 'Departed', color: 'text-violet-600', bg: 'bg-violet-100', icon: Ship },
  IN_TRANSIT: { label: 'In Transit', color: 'text-amber-600', bg: 'bg-amber-100', icon: Navigation },
  ARRIVED: { label: 'Arrived', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: Anchor },
  DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
};

const KPICard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function ContainerTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedContainer, setSelectedContainer] = useState<any>(null);

  const filteredContainers = useMemo(() => {
    return MOCK_CONTAINERS.filter(container => {
      const matchesSearch = 
        container.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.shippingLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || container.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const kpis = useMemo(() => ({
    total: MOCK_CONTAINERS.length,
    inTransit: MOCK_CONTAINERS.filter(c => c.status === 'IN_TRANSIT').length,
    arrived: MOCK_CONTAINERS.filter(c => c.status === 'ARRIVED').length,
    delivered: MOCK_CONTAINERS.filter(c => c.status === 'DELIVERED').length,
  }), []);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Container Tracking
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Real-time shipment tracking and logistics management
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Total Containers" value={kpis.total} subtitle="Active shipments" icon={Package} color="bg-indigo-500" />
        <KPICard title="In Transit" value={kpis.inTransit} subtitle="On the way" icon={Navigation} color="bg-amber-500" />
        <KPICard title="Arrived" value={kpis.arrived} subtitle="At destination port" icon={Anchor} color="bg-cyan-500" />
        <KPICard title="Delivered" value={kpis.delivered} subtitle="Completed" icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      <div className="mb-8">
        <MapTracking containers={filteredContainers} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search container, carrier, order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="ARRIVED">Arrived</option>
          <option value="DELIVERED">Delivered</option>
          <option value="LOADED">Loaded</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredContainers.map((container) => {
          const status = STATUS_CONFIG[container.status] || STATUS_CONFIG.BOOKED;
          const StatusIcon = status.icon;
          
          return (
            <motion.div
              key={container.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${status.bg}`}>
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{container.containerNumber}</h3>
                    <p className="text-xs text-gray-500">{container.shippingLine} • {container.containerType}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Route
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {container.originPort.code} → {container.destinationPort.code}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    ETA
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(container.eta).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-gray-500">{container.customerName}</span>
                <div className="flex items-center gap-2">
                  <Link href={container.trackingUrl} target="_blank" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setSelectedContainer(container)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredContainers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No containers found</h3>
        </motion.div>
      )}
    </div>
  );
}
