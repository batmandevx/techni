'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from '@/lib/DataContext';
import FloatingAIAssistant from '@/components/ai/FloatingAIAssistant';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/header';

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'S&OP Command Centre' },
  '/abc-dashboard': { title: 'ABC Analysis', sub: 'Inventory Classification' },
  '/forecasting': { title: 'Forecasting', sub: 'Demand Planning' },
  '/optimizer': { title: 'Order Optimizer', sub: 'Reorder Intelligence' },
  '/reports': { title: 'Reports', sub: 'Analytics & Insights' },
  '/orders': { title: 'Orders', sub: 'Order Management' },
  '/containers': { title: 'Containers', sub: 'Shipment Tracking' },
  '/production': { title: 'Production', sub: 'Planning & BOM' },
  '/kitting': { title: 'Kitting', sub: 'Co-packing & Bundles' },
  '/upload': { title: 'Data Upload', sub: 'AI-Powered Import' },
  '/ai-assistant': { title: 'AI Assistant', sub: 'Intelligent Insights' },
  '/settings': { title: 'Settings', sub: 'Platform Configuration' },
};

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default true to prevent hydration mismatch margin jumps
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth pages render without layout
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return <>{children}</>;
  }

  const pageInfo = PAGE_TITLES[pathname] || { title: 'TenchiOne', sub: 'S&OP Platform' };

  return (
    <DataProvider>
      <div className="min-h-screen flex" style={{ background: '#080d1a' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontSize: '13px',
            },
          }}
        />

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <motion.div
          initial={false}
          animate={{ marginLeft: isMobile ? 0 : (collapsed ? 72 : 260) }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="flex-1 flex flex-col min-w-0"
        >
          <Header
            onMenuClick={() => setMobileOpen(true)}
            pageTitle={pageInfo.title}
            pageSubtitle={pageInfo.sub}
          />

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </motion.div>

        <FloatingAIAssistant />
      </div>
    </DataProvider>
  );
}
