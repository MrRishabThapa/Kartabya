'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Game } from '@/data/games-types';
import ComingSoonModal from './ComingSoonModal';
import DuelLobby from './DuelLobby';
import QuizPanel from './QuizPanel';

interface Props {
  game: Game;
  index: number;
}

export default function GameCard({ game, index }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showDuelLobby, setShowDuelLobby] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const isAvailable = game.status === 'available';

  const handleClick = () => {
    if (game.id === 'flashcard-duel') {
      setShowDuelLobby(true);
      return;
    }
    if (game.id === 'daily-quiz') {
      setShowQuizPanel(true);
      return;
    }
    if (isAvailable && game.route) {
      router.push(game.route);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`
          relative w-full overflow-hidden rounded-2xl border border-slate-200
          bg-white text-left shadow-md transition-shadow duration-200
          hover:shadow-xl cursor-pointer
        `}
      >
        {/* 16:9 Canva banner slot */}
        <div className={`illustration-theme-frame relative aspect-video overflow-hidden bg-gradient-to-br ${game.gradient}`}>
          {game.bannerSrc ? (
            <Image
              src={game.bannerSrc}
              alt={`${game.title} banner`}
              fill
              className="illustration-theme-image object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-3 rounded-xl border-2 border-dashed border-white/40 bg-black/10" />
          )}

          <div className="illustration-theme-wash pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
        </div>

      </motion.button>

      {/* Coming soon modal for games that are not playable yet */}
      <ComingSoonModal
        game={game}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      {game.id === 'flashcard-duel' && (
        <AnimatePresence>
          {showDuelLobby && (
            <DuelLobby
              onClose={() => setShowDuelLobby(false)}
              onStartDuel={(roomCode) => router.push(`/games/duel?room=${encodeURIComponent(roomCode)}`)}
            />
          )}
        </AnimatePresence>
      )}
      {game.id === 'daily-quiz' && (
        <AnimatePresence>
          {showQuizPanel && <QuizPanel onClose={() => setShowQuizPanel(false)} />}
        </AnimatePresence>
      )}
    </>
  );
}
