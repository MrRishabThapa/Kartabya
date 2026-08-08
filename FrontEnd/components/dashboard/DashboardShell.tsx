"use client";

import type { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { MOCK_USER } from "@/data/dashboard-mock";
import type { UserProfile } from "@/data/dashboard-types";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { authUser, onboarding } = useUser();
  const user: UserProfile = {
    ...MOCK_USER,
    name: onboarding?.userName || authUser?.name?.trim() || authUser?.email.split("@")[0] || MOCK_USER.name,
    class: onboarding
      ? `${onboarding.targetCourse.grade} · ${onboarding.targetCourse.subject}`
      : MOCK_USER.class,
    companionName: onboarding?.foxNickname,
    avatarUrl: authUser?.avatar_url || undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="min-h-screen md:ml-24">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <TopBar user={user} notificationCount={5} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
