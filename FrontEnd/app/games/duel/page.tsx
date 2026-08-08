import type { Metadata } from 'next';
import DuelRoom from '@/components/games/DuelRoom';

export const metadata: Metadata = {
  title: 'Duel',
  description: 'Compete in a real-time coding duel.',
};

export default async function DuelPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const params = await searchParams;
  const roomCode = Array.isArray(params.room) ? params.room[0] : params.room;

  return <DuelRoom initialRoomCode={roomCode} />;
}
