import type { Metadata } from 'next';
import ComingSoon from '@/components/shared/ComingSoon';

export const metadata: Metadata = {
  title: 'Grades',
  description: 'Track your academic performance across all subjects.',
};

export default function GradePage() {
  return (
    <ComingSoon
      iconName="award"
      accentColor="#22C55E"
      title="Your Grades"
      description="Track your academic performance across all subjects. See detailed breakdowns, historical trends, and areas where you can improve."
      releaseHint="Coming soon"
      features={[
        { title: 'Subject-wise Report', description: 'Detailed grade breakdown for every subject, exam, and assessment.' },
        { title: 'Progress Trends', description: 'Visual charts showing how your grades have evolved over time.' },
        { title: 'Weakness Insights', description: 'Identify subjects and topics that need more attention.' },
        { title: 'Achievement Badges', description: 'Earn badges for improvements, streaks, and academic milestones.' },
      ]}
    />
  );
}