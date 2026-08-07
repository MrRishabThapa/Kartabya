import { MOCK_USER } from '@/data/dashboard-mock';
import ProfileCard from '@/components/dashboard/ProfileCard';
import SuggestedActivities from '@/components/dashboard/SuggestedActivities';
import AverageStudyTime from '@/components/dashboard/AverageStudyTime';
import YourProgress from '@/components/dashboard/YourProgress';
import RecentHistory from '@/components/dashboard/RecentHistory';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4 md:space-y-6">
        <ProfileCard user={MOCK_USER} />
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