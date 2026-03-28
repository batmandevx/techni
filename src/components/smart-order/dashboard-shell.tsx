"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronDown,
  Database,
  FileSpreadsheet,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShoppingBag,
  Upload,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/upload", label: "Upload Orders", icon: Upload },
  { href: "/dashboard/orders", label: "Order History", icon: ShoppingBag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const masterDataNav = [
  { href: "/dashboard/master-data/customers", label: "Customers" },
  { href: "/dashboard/master-data/materials", label: "Materials" },
  { href: "/dashboard/master-data/pricing", label: "Pricing" },
];

const secondaryNav = [
  { href: "/dashboard/templates", label: "Templates", icon: FileSpreadsheet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [masterOpen, setMasterOpen] = useState(true);

  const pageTitle = useMemo(() => {
    const current = [...nav, ...secondaryNav].find((item) => item.href === pathname);
    return current?.label ?? "Tenchi SmartOrder Engine";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[288px] shrink-0 border-r border-slate-200 bg-[linear-gradient(180deg,#10192c_0%,#16233a_55%,#0d1626_100%)] px-5 py-6 text-white xl:block">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_70px_-50px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e89a2d] text-slate-950">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">Tenchi Consulting</p>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-300">Strategy. Scale. Success.</p>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] bg-[#0a1220] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f2c78e]">SmartOrder Engine</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">AI-Driven Order Creation. Faster Fulfillment.</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-[#e89a2d] text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setMasterOpen((current) => !current)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-white/8"
            >
              <span className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                Master Data
              </span>
              <ChevronDown className={`h-4 w-4 transition ${masterOpen ? "rotate-180" : ""}`} />
            </button>
            {masterOpen ? (
              <div className="mt-2 space-y-1 border-l border-white/10 pl-4">
                {masterDataNav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-xl px-4 py-2.5 text-sm transition ${
                        active ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/6 hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="mt-8 space-y-2">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active ? "bg-[#e89a2d] text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">SAP Mock Mode</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              FastAPI mock service and the Next.js worker both simulate 95% success for demo-safe order creation.
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Tenchi SmartOrder Engine</p>
                <h1 className="mt-1 text-xl font-semibold text-slate-950">{pageTitle}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#e89a2d]" />
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e] text-white">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-950">Admin User</p>
                    <p className="text-xs text-slate-500">admin@tenchi.consulting</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto border-t border-slate-100 px-5 py-3 xl:hidden sm:px-8">
              <div className="flex min-w-max gap-2">
                {[...nav, ...masterDataNav.map((item) => ({ ...item, icon: Database })), ...secondaryNav].map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        active ? "bg-[#1a1a2e] text-white" : "border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
