import type { Metadata } from 'next';
import ComingSoon from '@/components/shared/ComingSoon';

export const metadata: Metadata = {
  title: 'Classes',
  description: 'Browse all your subjects, lessons, and course materials.',
};

export default function ClassesPage() {
  return (
    <ComingSoon
      iconName="book-open"
      accentColor="#F5A623"
      title="Your Classes"
      description="Browse all your subjects and enrolled courses. Jump into any lesson, review your notes, and track your journey across the entire curriculum."
      releaseHint="Coming soon"
      features={[
        { title: 'All Subjects at a Glance', description: 'See every subject you\'re enrolled in with progress and next lessons.' },
        { title: 'Smart Recommendations', description: 'Get personalized suggestions on what to study next based on your pace.' },
        { title: 'Teacher Notes', description: 'Access shared notes, resources, and study material from your teachers.' },
        { title: 'Class Discussions', description: 'Join topic-specific conversations with classmates and mentors.' },
      ]}
    />
  );
}