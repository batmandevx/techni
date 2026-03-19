'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  Truck, 
  FileText,
  ChevronDown,
  Download,
  RefreshCw,
  ArrowUpRight,
  Calendar
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

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  CREATED: { color: '#6b7280', bg: '#f3f4f6', icon: FileText },
  CONFIRMED: { color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle },
  SCHEDULED: { color: '#f59e0b', bg: '#fef3c7', icon: Calendar },
  SHIPPED: { color: '#06b6d4', bg: '#cffafe', icon: Truck },
  DELIVERED: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
  INVOICED: { color: '#8b5cf6', bg: '#ede9fe', icon: FileText },
  CONFIRMED_EXCEL: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle },
};

export default function OrdersPage() {
  const { orders: rawOrders, customers, materials } = useData();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Map contextual orders to the new interface
  const orders = useMemo(() => {
    return rawOrders.map((o: any) => {
      const customer = customers.find(c => c.id === o.customerId) || { name: 'Unknown', country: 'Unknown' };
      const material = materials.find(m => m.id === o.materialId) || { description: 'Unknown', priceUSD: 0 };
      return {
        id: o.orderId || Math.random().toString(),
        orderId: o.orderId || o.id,
        orderDate: o.orderDate || new Date().toISOString(),
        status: (o.status || 'CONFIRMED').toUpperCase(),
        customer,
        orderLines: [
          { quantity: o.quantity || 0, material }
        ]
      };
    });
  }, [rawOrders, customers, materials]);

  const refreshOrders = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    // Listen for dashboard refresh event
    window.addEventListener('dashboard-refresh', refreshOrders);
    return () => window.removeEventListener('dashboard-refresh', refreshOrders);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderLines?.some(l => l.material?.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['ALL', ...Array.from(new Set(orders.map(o => o.status)))];

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.CREATED;
    const Icon = config.icon;
    return (
      <span 
        className="badge" 
        style={{ 
          backgroundColor: config.bg, 
          color: config.color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          textTransform: 'capitalize'
        }}
      >
        <Icon size={12} />
        {status.toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(90deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Order Management
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Track and manage sales orders across the supply chain
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            onClick={refreshOrders}
            className="btn-modern btn-secondary-modern hover-lift"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="btn-modern btn-primary-modern hover-lift">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-kpi" style={{ marginBottom: '2rem' }}>
        {statuses.filter(s => s !== 'ALL').map((status, index) => {
          const count = orders.filter(o => o.status === status).length;
          const config = statusConfig[status] || statusConfig.CREATED;
          const isActive = statusFilter === status;
          const Icon = config.icon;
          
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? 'ALL' : status)}
              className="card-modern hover-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: isActive ? `1px solid ${config.color}` : undefined,
                boxShadow: isActive ? `0 0 20px ${config.color}30` : undefined,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <span 
                  className="badge-modern" 
                  style={{ 
                    backgroundColor: isActive ? config.color : `${config.color}20`, 
                    color: isActive ? 'white' : config.color,
                    border: `1px solid ${config.color}40`,
                    marginBottom: '0.5rem',
                    display: 'inline-block'
                  }}
                >
                  {status.toLowerCase()}
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {count}
                </div>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${config.color}40, ${config.color}10)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={24} style={{ color: config.color }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="card-modern" style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem 1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Export Button */}
        <ExportButton 
          data={filteredOrders.map(o => ({
            'Order ID': o.orderId,
            'Customer': o.customer?.name,
            'Country': o.customer?.country,
            'Status': o.status,
            'Quantity': o.orderLines?.reduce((sum, l) => sum + l.quantity, 0),
            'Total Value': o.orderLines?.reduce((sum, l) => sum + (l.quantity * l.material?.priceUSD), 0),
            'Order Date': new Date(o.orderDate).toLocaleDateString(),
          }))}
          filename="orders"
          onExport={() => showToast('Orders exported successfully!', 'success')}
        />
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
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
            style={{ 
              appearance: 'none', 
              paddingRight: '3rem', 
              minWidth: '200px',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Status</option>
            {statuses.filter(s => s !== 'ALL').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Filter size={18} style={{ 
            position: 'absolute', 
            right: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }} />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-modern" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const totalQty = order.orderLines?.reduce((sum, l) => sum + l.quantity, 0) || 0;
                const totalValue = order.orderLines?.reduce((sum, l) => sum + (l.quantity * (l.material?.priceUSD || 0)), 0) || 0;
                const config = statusConfig[order.status] || statusConfig.CREATED;
                
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsModalOpen(true);
                    }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
                    className="hover:bg-slate-800/50"
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: config.color }}></div>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f8fafc', fontSize: '1rem' }}>
                          {order.orderId}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
                          {order.customer?.name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {order.customer?.country}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div>
                        {order.orderLines?.map((line, idx) => (
                          <div key={idx} style={{ fontWeight: 500, color: '#cbd5e1' }}>
                            {line.material?.description || 'Unknown Product'}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: '#f8fafc' }}>
                      {totalQty.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <Calendar size={16} style={{ color: '#6366f1' }} />
                        {new Date(order.orderDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span 
                        className="badge-modern" 
                        style={{ 
                          backgroundColor: `${config.color}20`, 
                          color: config.color,
                          border: `1px solid ${config.color}40`,
                        }}
                      >
                        {order.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(30, 41, 59, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <Package size={40} style={{ color: '#64748b' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              No orders found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              {orders.length === 0 
                ? 'Upload an Excel file to see your orders here.' 
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}

        {/* Table Footer */}
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#94a3b8'
        }}>
          <span style={{ fontWeight: 500 }}>Showing <span style={{ color: '#f8fafc' }}>{filteredOrders.length}</span> of <span style={{ color: '#f8fafc' }}>{orders.length}</span> orders</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-modern btn-secondary-modern" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Previous</button>
            <button className="btn-modern btn-secondary-modern" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Next</button>
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
