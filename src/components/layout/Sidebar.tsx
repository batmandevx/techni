'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Upload,
  MessageSquare,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/forecasting', label: 'Forecasting', icon: TrendingUp },
  { href: '/upload', label: 'Upload Data', icon: Upload },
  { href: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          Tenchi<span>S&OP</span>
        </div>
        <div className="sidebar-subtitle">Sales & Operations Planning</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
        <button className="nav-link" style={{ width: '100%', marginTop: '0.5rem' }}>
          <LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
