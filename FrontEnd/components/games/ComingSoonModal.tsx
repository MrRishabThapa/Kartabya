'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Game } from '@/data/games-types';
import DuolingoButton from '@/components/shared/Button';


interface Props {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({ game, isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[92vw] max-w-md
                       bg-white rounded-3xl shadow-2xl
                       overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 p-2 rounded-full
                         text-slate-400 hover:text-slate-700 hover:bg-slate-100
                         transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/*
              🎨 Illustration section
              Uses undraw illustration with violet theme
              Place your SVG at: /public/assets/illustrations/coming-soon.svg
            */}
            <div className="bg-violet-50 pt-10 pb-6 px-6 flex items-center justify-center">
              <div className="relative w-48 h-40">
                <Image
                  src="/assets/illustrations/coming-soon.svg"
                  alt="Coming soon illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 md:px-8 pt-6 pb-8 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                              bg-violet-100 text-violet-700 text-xs font-bold">
                <Sparkles size={12} strokeWidth={2.5} />
                Launching Soon
              </div>

              {/* Title */}
              <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                {game.title}
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                {game.description}
              </p>

              {/* Stats */}
              <div className="mt-5 flex items-center justify-center gap-6 py-3
                              border-y border-slate-100">
                <div>
                  <div className="text-lg font-extrabold text-slate-800">
                    {game.estimatedMinutes} min
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    per session
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-lg font-extrabold text-violet-600">
                    +{game.xpReward} XP
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    reward
                  </div>
                </div>
               
              </div>

              {/* CTA */}
              <div className="mt-6">
                <DuolingoButton
                  variant="primary"
                  onClick={onClose}
                  className="!w-full !px-4"
                >
                  <span className="inline-flex items-center gap-2">
                    <Bell size={16} strokeWidth={2.5} />
                    Notify Me on Launch
                  </span>
                </DuolingoButton>
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                We'll email you the moment {game.title} goes live.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}