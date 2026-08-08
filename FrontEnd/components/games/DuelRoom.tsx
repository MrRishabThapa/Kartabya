'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import DuelGame from '@/components/games/DuelGame';
import DuelLobby from '@/components/games/DuelLobby';

export default function DuelRoom({ initialRoomCode }: { initialRoomCode?: string }) {
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode ?? null);

  return roomCode ? (
    <DuelGame roomCode={roomCode} status="ACTIVE" />
  ) : (
    <AnimatePresence>
      <DuelLobby onStartDuel={setRoomCode} />
    </AnimatePresence>
  );
}
