'use client';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles } from 'lucide-react';

interface Props {
  totalGames: number;
}

export default function GamesHeader({ totalGames }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl
                        bg-orange-50 flex-shrink-0">
          <Gamepad2 size={24} className="text-orange-500" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              Adaptiv Challenges
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             text-[10px] font-bold uppercase tracking-wider
                             bg-brand-primary-tint text-brand-primary-dark">
              <Sparkles size={10} strokeWidth={2.5} />
              Launching Soon
            </span>
          </div>
          <p className="mt-1 text-slate-500 text-sm leading-relaxed">
            {totalGames} games in the pipeline. Play, compete, and learn across every subject.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
