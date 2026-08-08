"use client";

import { useUser } from "@/context/UserContext";
import { MOCK_USER } from "@/data/dashboard-mock";
import ProfileCard from "@/components/dashboard/ProfileCard";
import SuggestedActivities from "@/components/dashboard/SuggestedActivities";
import AverageStudyTime from "@/components/dashboard/AverageStudyTime";
import YourProgress from "@/components/dashboard/YourProgress";
import RecentHistory from "@/components/dashboard/RecentHistory";

export default function DashboardPage() {
  const { authUser, onboarding } = useUser();
  const user = {
    ...MOCK_USER,
    name: onboarding?.userName || authUser?.name?.trim() || authUser?.email.split("@")[0] || MOCK_USER.name,
    class: onboarding
      ? `${onboarding.targetCourse.grade} · ${onboarding.targetCourse.subject}`
      : MOCK_USER.class,
    companionName: onboarding?.foxNickname,
    avatarUrl: authUser?.avatar_url || undefined,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4 md:space-y-6">
        <ProfileCard user={user} />
        <SuggestedActivities />
        <YourProgress />
      </div>
      <div className="space-y-4 md:space-y-6">
        <AverageStudyTime />
        <RecentHistory />
      </div>
    </div>
  );
}
