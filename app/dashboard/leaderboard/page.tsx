import type { Metadata } from 'next';
import { MOCK_LEADERBOARD } from '@/data/leaderboard-mock';
import Leaderboard from '@/components/leaderboard/Leaderboard';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See how you rank against your class and the Arcademia community.',
};

export default function LeaderboardPage() {
  return <Leaderboard data={MOCK_LEADERBOARD} />;
}