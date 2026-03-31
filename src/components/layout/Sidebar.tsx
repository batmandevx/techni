'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, BarChart3, Package, Settings,
  Truck, Layers, FileText, Sparkles, ChevronLeft, ChevronRight,
  Menu, X, Activity, LogOut, User, Brain, Zap, ShoppingCart, Cog
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/main', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/abc-dashboard', label: 'ABC Analysis', icon: BarChart3 },
  { path: '/forecasting', label: 'Forecasting', icon: Activity },
  { path: '/optimizer', label: 'Order Optimizer', icon: Zap },
  { path: '/orders', label: 'Orders', icon: ShoppingCart, badge: 0 },
  { path: '/containers', label: 'Containers', icon: Truck },
  { path: '/production', label: 'Production', icon: Cog },
  { path: '/kitting', label: 'Kitting', icon: Layers },
  { path: '/upload', label: 'Data Upload', icon: Upload },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Brain },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

function NavItemComponent({ 
  item, 
  isActive, 
  collapsed 
}: { 
  item: NavItem; 
  isActive: boolean; 
  collapsed: boolean;
}) {
  const Icon = item.icon;
  
  return (
    <Link href={item.path} className="block">
      <div
        className={cn(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
          isActive
            ? 'text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebarActive"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border border-indigo-500/30"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
          />
        )}
        
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
        )}

        <div className={cn(
          'relative z-10 flex items-center justify-center w-5 h-5 flex-shrink-0',
          isActive ? 'text-indigo-300' : ''
        )}>
          <Icon className="w-[18px] h-[18px]" />
        </div>

        {!collapsed && (
          <>
            <span className="relative z-10 text-sm font-medium flex-1 truncate">
              {item.label}
            </span>
            {item.badge !== undefined && Number(item.badge) > 0 && (
              <span className="relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {item.badge}
              </span>
            )}
          </>
        )}

        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-white/10 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
            {item.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
          </div>
        )}
      </div>
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Check for auth in localStorage
    const auth = localStorage.getItem('tenchi_auth');
    if (auth) {
      try {
        const data = JSON.parse(auth);
        if (data.expiresAt > Date.now()) {
          setUser(data.user);
        } else {
          localStorage.removeItem('tenchi_auth');
        }
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tenchi_auth');
    router.push('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div 
      className={cn(
        'flex flex-col h-full',
        mobile ? 'w-72' : collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 h-16 border-b border-white/6 flex-shrink-0">
        <Link href="/main" className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <div className="font-bold text-white text-sm leading-tight">TenchiOne</div>
              <div className="text-[10px] text-slate-500 leading-tight truncate">S&OP Platform</div>
            </div>
          )}
        </Link>
        {!mobile && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
        {mobile && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <NavItemComponent
            key={item.path}
            item={item}
            isActive={pathname === item.path || (item.path !== '/main' && pathname?.startsWith(item.path))}
            collapsed={collapsed && !mobile}
          />
        ))}
      </nav>

      {/* Bottom: status + auth */}
      <div className="flex-shrink-0 p-2.5 border-t border-white/6">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">Systems Operational</span>
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user ? getInitials(user.name) : 'GU'}
            </span>
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user?.name || 'Guest User'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user?.email || 'Not signed in'}
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {(!collapsed || mobile) && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2 py-2 mt-1 w-full rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-rose-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        )}

        {(!collapsed || mobile) && (
          <div className="mt-2 px-3 text-center text-[10px] text-slate-700">
            TenchiOne v2.5.0
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 overflow-hidden flex-shrink-0 bg-gradient-to-b from-[#0c1220] to-[#080d1a] border-r border-white/6"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onMobileClose}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute left-0 top-0 bottom-0 overflow-hidden bg-gradient-to-b from-[#0c1220] to-[#080d1a] border-r border-white/6"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
