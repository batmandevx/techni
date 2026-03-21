'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  XCircle,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Layers,
  BoxIcon,
  Calendar,
  LogOut
} from 'lucide-react';
import { DataProvider } from '@/lib/DataContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CommandPalette } from '@/components/CommandPalette';
import { Notifications } from '@/components/Notifications';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { FloatingChatbot } from '@/components/FloatingChatbot';
import { useToast } from '@/components/Toast';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { UIProvider } from '@/components/ui';
import { performABCAnalysis } from '@/lib/forecasting';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import { useAuth } from '@/lib/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, badge: null },
  { name: 'ABC Analysis', href: '/abc-dashboard', icon: Layers, badge: null },
  { name: 'Forecasting', href: '/forecasting', icon: BarChart3, badge: 'AI' },
  { name: 'Order Optimizer', href: '/optimizer', icon: Package, badge: null },
  { name: 'Orders', href: '/orders', icon: ShoppingCart, badge: null },
  { name: 'Upload Data', href: '/upload', icon: Upload, badge: null },
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
  
  if (!time) return <div className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg w-32 h-8" />;
  
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-medium">{time}</span>
      <span className="text-gray-300">|</span>
      <span className="text-gray-500 text-sm">{date}</span>
    </div>
  );
}

// Quick Stat Card with Modal
function QuickStat({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  label: string; 
  value: string; 
  icon: any; 
  color: string;
  onClick?: () => void;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer bg-white dark:bg-slate-800/80 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all"
      style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      </div>
    </motion.div>
  );
}

// SKU Details Modal
function SKUDetailsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [abcData, setAbcData] = useState<any[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      const materialsWithHistory = MATERIALS.map(mat => {
        const history = HISTORICAL_DATA[mat.id] || [];
        const historicalSales = history.map((h: any) => h.actualSales).filter((s: number) => s > 0);
        const latest = history[history.length - 1];
        const currentStock = latest ? latest.openingStock + latest.stockInTransit - latest.actualSales : 0;
        
        return {
          id: mat.id,
          description: mat.description,
          priceUSD: mat.priceUSD,
          category: mat.category || 'Uncategorized',
          historicalSales,
          currentStock,
          forecastDemand: latest?.forecast || 0,
        };
      });
      
      const analysis = performABCAnalysis(materialsWithHistory);
      setAbcData(analysis);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-5xl max-h-[80vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BoxIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">SKU-Level Details</h3>
                  <p className="text-indigo-100 text-sm">Inventory breakdown by SKU</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ABC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Coverage</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {abcData.map((item, i) => (
                    <tr key={item.materialId} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg font-bold text-white ${
                          item.classification === 'A' ? 'bg-emerald-500' :
                          item.classification === 'B' ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.materialId}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.materialName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-right">{item.currentStock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={item.stockCoverageMonths < 1 ? 'text-red-600' : item.stockCoverageMonths < 2 ? 'text-amber-600' : 'text-emerald-600'}>
                          {item.stockCoverageMonths.toFixed(1)} mo
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.stockCoverageMonths < 1 ? (
                          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">Action for Provision</span>
                        ) : item.stockCoverageMonths < 2 ? (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Action for Sales</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Healthy</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Background Component
function AnimatedBackground() {
  const { isDark } = useTheme();
  
  return (
    <>
      <div className="fixed inset-0 -z-10 animate-gradient bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
      <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-gradient-radial from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-gradient-radial from-purple-500/10 to-transparent pointer-events-none" />
    </>
  );
}

// Main Layout Content
function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSKUModal, setShowSKUModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { ToastContainer } = useToast();
  const { logout, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'AD';
  const displayName = user?.name || 'Admin';
  const role = user?.role || 'Administrator';

  // Compute real total stock value from mock data
  const totalStockValue = (() => {
    let total = 0;
    MATERIALS.forEach(mat => {
      const history = HISTORICAL_DATA[mat.id] || [];
      const latest = history[history.length - 1];
      if (latest) {
        const currentStock = Math.max(0, latest.openingStock + latest.stockInTransit - latest.actualSales);
        total += currentStock * mat.priceUSD;
      }
    });
    return total;
  })();

  const inventoryDisplay = totalStockValue >= 1000000
    ? `$${(totalStockValue / 1000000).toFixed(1)}M`
    : totalStockValue >= 1000
    ? `$${(totalStockValue / 1000).toFixed(1)}k`
    : `$${totalStockValue.toFixed(0)}`;

  return (
    <div className="flex min-h-screen">
      <AnimatedBackground />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-slate-800 z-40 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tenchi
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Sales & Operations</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <p className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' 
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-indigo-500' : ''} />
                  <span className="flex-1 font-medium">{item.name}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      item.badge === 'New' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={16} className="text-indigo-500" />}
                </Link>
              </motion.div>
            );
          })}

          {/* Quick Stats */}
          <div className="mt-8">
            <p className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Stats</p>
            <div className="space-y-3">
              <Link href="/orders" className="block">
                <QuickStat label="Active Orders" value="24" icon={ShoppingCart} color="#6366f1" />
              </Link>
              <div onClick={() => setShowSKUModal(true)} className="block cursor-pointer">
                <QuickStat label="Inventory" value={inventoryDisplay} icon={Package} color="#10b981" />
              </div>
              <Link href="/orders" className="block">
                <QuickStat label="Customers" value="7" icon={Users} color="#f59e0b" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <p className="text-xs text-center text-gray-400">
            © {new Date().getFullYear()} Tenchi S&OP v2.0
          </p>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, customers, SKUs..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <LiveClock />
              <ThemeToggle />
              <CommandPalette />
              <Notifications />
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-500/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{role}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'admin@tenchi.com'}</p>
                    </div>
                    
                    <div className="p-2">
                      <Link href="/settings" onClick={() => setDropdownOpen(false)}>
                        <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </div>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <DataProvider>
            {children}
          </DataProvider>
        </div>
        
        <ToastContainer />
        <KeyboardShortcuts />
        <FloatingChatbot />
      </main>

      {/* SKU Details Modal */}
      <SKUDetailsModal isOpen={showSKUModal} onClose={() => setShowSKUModal(false)} />
    </div>
  );
}

// Wrapper with ThemeProvider and ErrorBoundary
export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UIProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </UIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
