import type { Metadata } from 'next';
import Leaderboard from '@/components/leaderboard/Leaderboard';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See how you rank against your class and the Adaptiv community.',
};

export default function LeaderboardPage() {
  return <Leaderboard />;
}
