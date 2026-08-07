import type { Metadata } from 'next';
import CommunityFeed from '@/components/community/CommunityFeed';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Connect with other students, teachers, and AI tutors.',
};

export default function CommunityPage() {
  return <CommunityFeed />;
}
