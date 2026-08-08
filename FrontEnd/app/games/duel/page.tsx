import type { Metadata } from 'next';
import DuelGame from '@/components/games/DuelGame';

export const metadata: Metadata = {
  title: 'Duel',
  description: 'Compete in a real-time coding duel.',
};

export default function DuelPage() {
  return <DuelGame />;
}
