import type { Metadata } from "next";
import type { ReactNode } from "react";
import SessionGuard from "@/components/shared/SessionGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: {
    template: "%s · Adaptiv",
    default: "Dashboard · Adaptiv",
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard>
      <DashboardShell>{children}</DashboardShell>
    </SessionGuard>
  );
}
