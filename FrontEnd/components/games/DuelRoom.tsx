'use client';

import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DuelGame from '@/components/games/DuelGame';
import DuelLobby from '@/components/games/DuelLobby';
import { clearStoredDuelRoomCode, createDuelRoom, duelErrorCode, getDuelRoom, joinDuelRoom } from '@/lib/duel/api';
import { useDuelRoom } from '@/hooks/useDuelRoom';

function DuelSession({ roomCode, onRoomError }: { roomCode: string; onRoomError: () => void }) {
  const router = useRouter();
  const duel = useDuelRoom(roomCode);
  const reportedError = useRef<string | null>(null);
  const currentUserId = duel.room?.current_user_id;
  const didWin = duel.result ? duel.result.winner_user_id === currentUserId : undefined;

  useEffect(() => {
    if (!duel.error || duel.room || reportedError.current === duel.error) return;
    reportedError.current = duel.error;
    toast.error(duel.error);
    onRoomError();
  }, [duel.error, duel.room, onRoomError]);

  if (duel.loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading duel…</div>;
  if (duel.error && !duel.room) return null;

  const room = duel.room;
  if (!room) return null;

  return (
    <DuelGame
      roomCode={room.code}
      status={room.status === 'ACTIVE' ? 'ACTIVE' : room.status === 'OVER' || room.status === 'EXPIRED' || room.status === 'CANCELLED' ? 'OVER' : 'WAITING'}
      problemTitle={room.challenge.title}
      problemDescription={room.challenge.description}
      targetOutput={room.challenge.target_output ?? undefined}
      initialCode={room.challenge.starter_code}
      buggyCode={room.challenge.buggy_code ?? undefined}
      language={room.challenge.language ?? room.language}
      remainingSeconds={duel.remainingSeconds}
      opponentSubmitted={Boolean(duel.notice?.toLowerCase().includes('submitted'))}
      onReady={duel.ready}
      readyPending={duel.readyPending}
      isReady={duel.currentPlayer?.is_ready ?? false}
      playersReady={room.players.length === 2 && room.players.every((player) => player.is_ready)}
      onRunTests={duel.runTests}
      onSubmit={duel.submit}
      submission={duel.submission}
      result={duel.result}
      didWin={didWin}
      error={duel.error}
      notice={duel.notice}
      connection={duel.connection}
      opponentState={duel.opponentState}
      onTyping={duel.sendTyping}
      terminal={['OVER', 'EXPIRED', 'CANCELLED'].includes(room.status)}
      onTryAgain={() => router.replace('/dashboard/games?duel=open')}
    />
  );
}

export default function DuelRoom({ initialRoomCode }: { initialRoomCode?: string }) {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode ?? null);

  return roomCode ? (
    <DuelSession
      roomCode={roomCode}
      onRoomError={() => {
        clearStoredDuelRoomCode();
        router.replace('/dashboard/games?duel=open');
      }}
    />
  ) : (
    <AnimatePresence>
      <DuelLobby
        onStartDuel={setRoomCode}
        onCreateRoom={async (language) => {
          const response = await createDuelRoom(language);
          if (!response.room?.code) throw new Error('The duel service returned no room code.');
          return response.room.code;
        }}
        onJoinRoom={async (code) => {
          try {
            const response = await joinDuelRoom(code);
            return response.room?.code ?? code;
          } catch (joinError) {
            if (duelErrorCode(joinError) !== 'ALREADY_IN_ROOM') throw joinError;
            const existingRoom = await getDuelRoom(code);
            return existingRoom.code;
          }
        }}
      />
    </AnimatePresence>
  );
}
