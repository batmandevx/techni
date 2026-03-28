import { DashboardShell } from "@/components/smart-order/dashboard-shell";

export default function SmartOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}

