'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Game } from '@/data/games-types';
import ComingSoonModal from './ComingSoonModal';

interface Props {
  game: Game;
  index: number;
}

export default function GameCard({ game, index }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const isAvailable = game.status === 'available';

  const handleClick = () => {
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
          relative w-full aspect-square rounded-2xl
          bg-gradient-to-br ${game.gradient}
          overflow-hidden group text-left
          shadow-md hover:shadow-xl transition-shadow duration-200
          cursor-pointer
        `}
      >
        {/* Subtle depth overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5
                        pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full
                        bg-white/10 blur-2xl pointer-events-none" />

        {/* Top row: title + stat */}
        <div className="relative z-10 flex items-start justify-between p-3 md:p-4">
          <div>
            <h3 className="text-white font-extrabold text-base md:text-lg tracking-tight
                           drop-shadow leading-tight">
              {game.title}
            </h3>
            {game.isNew && (
              <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded
                               bg-white/25 backdrop-blur-sm
                               text-white text-[9px] font-extrabold uppercase tracking-wider">
                New
              </span>
            )}
          </div>

          
        </div>

        {/* Static graphic — no animation */}
        <div className="absolute bottom-0 right-0 pointer-events-none
                        text-5xl md:text-6xl leading-none select-none
                        translate-x-1 translate-y-1
                        drop-shadow-xl opacity-95">
          {game.graphic}
        </div>

        {/* Bottom-left tagline */}
        <div className="absolute bottom-2.5 left-3 md:bottom-3 md:left-4 z-10">
          <p className="text-white/90 text-[10px] md:text-[11px] font-semibold">
            {game.tagline}
          </p>
          {game.status === 'coming-soon' && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-white/70
                            text-[8px] font-bold uppercase tracking-wider">
              <Sparkles size={8} strokeWidth={2.5} />
              Coming soon
            </div>
          )}
        </div>
      </motion.button>

      {/* Coming soon modal */}
      <ComingSoonModal
        game={game}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}