'use client';

import { useEffect, useState } from 'react';
import { X, Package, User, Calendar, DollarSign, Truck, FileText, MapPin } from 'lucide-react';

interface Order {
  id: string;
  orderId?: string;
  orderDate: string;
  status: string;
  totalAmount?: number;
  customer?: {
    name: string;
    country: string;
    shipToCity?: string;
  };
  lines?: Array<{
    quantity: number;
    unitPrice: number;
    lineTotal?: number;
    material?: {
      description: string;
      id: string;
    };
  }>;
}

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  CREATED: '#6366f1',
  CONFIRMED: '#10b981',
  SCHEDULED: '#f59e0b',
  SHIPPED: '#06b6d4',
  DELIVERED: '#10b981',
  INVOICED: '#8b5cf6',
};

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !order) return null;

  const totalQty = order.lines?.reduce((sum, l) => sum + l.quantity, 0) || 0;
  const totalValue = order.lines?.reduce((sum, l) => sum + ((l.lineTotal || l.quantity * l.unitPrice)), 0) || 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'scaleIn 0.3s ease-out',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              Order Details
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{order.orderId || order.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Status Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <span
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: `${statusColors[order.status] || '#6366f1'}20`,
                color: statusColors[order.status] || '#6366f1',
                border: `1px solid ${statusColors[order.status] || '#6366f1'}40`,
              }}
            >
              {order.status}
            </span>
          </div>

          {/* Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <InfoCard icon={User} label="Customer" value={order.customer?.name || 'Unknown'} subvalue={order.customer?.country} />
            <InfoCard icon={Calendar} label="Order Date" value={new Date(order.orderDate).toLocaleDateString()} />
            <InfoCard icon={Package} label="Total Quantity" value={`${totalQty.toLocaleString()} units`} />
            <InfoCard icon={DollarSign} label="Total Value" value={`$${totalValue.toLocaleString()}`} color="#10b981" />
          </div>

          {/* Line Items */}
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '16px' }}>Line Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.lines?.map((line, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{line.material?.description || 'Unknown Product'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{line.material?.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>${(line.lineTotal || line.quantity * line.unitPrice).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Qty: {line.quantity}</span>
                  <span>Price: ${line.unitPrice}/unit</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Truck size={18} />
              Track Shipment
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FileText size={18} />
              View Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, subvalue, color }: { icon: any; label: string; value: string; subvalue?: string; color?: string }) {
  return (
    <div
      style={{
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: color ? `${color}20` : 'rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} style={{ color: color || '#6366f1' }} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{value}</div>
        {subvalue && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subvalue}</div>}
      </div>
    </div>
  );
}
