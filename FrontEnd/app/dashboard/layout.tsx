import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MOCK_USER } from "@/data/dashboard-mock";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
// Development: authentication guard temporarily disabled.
// import SessionGuard from '@/components/shared/SessionGuard';

export const metadata: Metadata = {
  title: {
    template: "%s · Adaptiv",
    default: "Dashboard · Adaptiv",
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    // Development: render dashboard pages without requiring login.
    // Re-enable SessionGuard around this content before production.
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="md:ml-24 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <TopBar user={MOCK_USER} notificationCount={5} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
