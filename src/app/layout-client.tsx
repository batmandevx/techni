'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  ShoppingCart,
  Sparkles,
  FileText,
  Settings,
  Menu,
  X,
  ChevronRight,
  Package,
  Users,
  TrendingUp,
  Bell,
  Search
} from 'lucide-react';
import { DataProvider } from '@/lib/DataContext';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { FloatingChatbot } from '@/components/FloatingChatbot';
import { useToast } from '@/components/Toast';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { UIProvider } from '@/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { name: 'Upload Data', href: '/upload', icon: Upload, badge: null },
  { name: 'Forecasting', href: '/forecasting', icon: BarChart3, badge: 'AI' },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, badge: null },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, badge: 'New' },
  { name: 'Reports', href: '/reports', icon: FileText, badge: null },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

// Live Clock Component
function LiveClock() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  
  if (!time) return <div className="skeleton-modern" style={{ width: 120, height: 24 }} />;
  
  return (
    <div className="glass" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px',
      padding: '10px 16px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: 500
    }}>
      <div className="status-dot info" style={{ width: 6, height: 6 }} />
      <span style={{ color: 'var(--accent)' }}>{time}</span>
      <span style={{ color: 'var(--text-muted)' }}>|</span>
      <span style={{ color: 'var(--text-muted)' }}>{date}</span>
    </div>
  );
}

// Quick Stat Card
function QuickStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="card-modern" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}

// Background Component
function AnimatedBackground() {
  const { isDark, mounted } = useTheme();
  
  // Default to dark theme during SSR
  const isDarkMode = mounted ? isDark : true;
  
  return (
    <>
      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 25%, #f5f3ff 50%, #e0e7ff 75%, #f0f9ff 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        zIndex: -1,
        transition: 'background 0.5s ease',
      }} />
      
      {/* Decorative Orbs */}
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: isDarkMode
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)'
          : 'radial-gradient(circle, rgba(79, 70, 229, 0.08), transparent 70%)',
        top: '-200px',
        right: '-200px',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.5s ease',
      }} />
      <div style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: isDarkMode
          ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%)'
          : 'radial-gradient(circle, rgba(124, 58, 237, 0.06), transparent 70%)',
        bottom: '-100px',
        left: '-100px',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'background 0.5s ease',
      }} />
    </>
  );
}

// Logo Component
function Logo() {
  const { isDark, mounted } = useTheme();
  
  // Default to dark theme during SSR
  const isDarkMode = mounted ? isDark : true;
  
  return (
    <div style={{ 
      padding: '1.5rem',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isDarkMode ? '0 0 20px rgba(99, 102, 241, 0.5)' : '0 0 20px rgba(79, 70, 229, 0.3)',
        animation: 'pulse 3s ease-in-out infinite',
      }}>
        <TrendingUp size={22} style={{ color: 'white' }} />
      </div>
      <div>
        <div style={{ 
          fontWeight: 800, 
          fontSize: '1.25rem', 
          background: isDarkMode 
            ? 'linear-gradient(90deg, #f8fafc, #a5b4fc)' 
            : 'linear-gradient(90deg, #0f172a, #4f46e5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'background 0.5s ease',
        }}>Tenchi</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sales & Operations</div>
      </div>
    </div>
  );
}

// Notification Button
function NotificationButton() {
  const { isDark, mounted } = useTheme();
  
  // Default to dark theme during SSR
  const isDarkMode = mounted ? isDark : true;
  
  return (
    <button className="btn-modern btn-secondary-modern" style={{ padding: '10px', position: 'relative' }}>
      <Bell size={20} />
      <span style={{
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--danger)',
        boxShadow: isDarkMode ? '0 0 10px var(--danger)' : 'none',
      }} />
    </button>
  );
}

// Main Layout Content
function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { ToastContainer } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="page-container" style={{ display: 'flex' }}>
      <AnimatedBackground />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="btn-modern btn-secondary-modern mobile-menu-btn"
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          display: 'none',
          padding: '10px',
        }}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-modern { transform: translateX(${mobileMenuOpen ? '0' : '-100%'}); }
          .main-content-modern { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar-modern glass-strong" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
      }}>
        <Logo />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '0.75rem', paddingLeft: '0.75rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Main Menu
          </div>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
                  transition: 'all 0.3s',
                  animation: mounted ? `fadeInUp 0.4s ease-out ${index * 0.05}s both` : 'none',
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span style={{ flex: 1, fontWeight: isActive ? 600 : 500 }}>{item.name}</span>
                {item.badge && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    background: item.badge === 'New' ? 'linear-gradient(135deg, var(--accent), #f472b6)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} style={{ color: 'var(--primary)' }} />}
              </Link>
            );
          })}

          {/* Quick Stats */}
          <div style={{ marginTop: '2rem', marginBottom: '0.75rem', paddingLeft: '0.75rem', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Quick Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <QuickStat label="Active Orders" value="24" icon={ShoppingCart} color="#6366f1" />
            <QuickStat label="Inventory" value="1.2k" icon={Package} color="#10b981" />
            <QuickStat label="Customers" value="7" icon={Users} color="#f59e0b" />
          </div>
        </nav>

        {/* Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }} suppressHydrationWarning>
          &copy; {new Date().getFullYear()} Tenchi S&OP v2.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content-modern" style={{
        marginLeft: '280px',
        flex: 1,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Top Bar */}
        <div className="glass" style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search orders, customers..." 
              className="input-modern"
              style={{ paddingLeft: 42 }}
            />
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LiveClock />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <NotificationButton />

            {/* User */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'white',
              }}>
                AD
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Admin</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
          <DataProvider>
            {children}
          </DataProvider>
        </div>
        
        {/* Toast Notifications */}
        <ToastContainer />
        
        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts />
        
        {/* Floating Chatbot */}
        <FloatingChatbot />
      </main>
    </div>
  );
}

// Wrapper with ThemeProvider and ErrorBoundary
export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UIProvider>
          <LayoutContent>{children}</LayoutContent>
        </UIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
