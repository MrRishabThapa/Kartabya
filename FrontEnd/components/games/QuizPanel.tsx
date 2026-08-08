'use client';

import { motion } from 'framer-motion';
import { ListChecks, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import QuizContainer from '@/components/quiz/QuizContainer';

interface QuizPanelProps {
  onClose: () => void;
}

export default function QuizPanel({ onClose }: QuizPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-quiz-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-slate-200 bg-slate-50 shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <header className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-primary">
              <ListChecks size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                <Sparkles size={12} aria-hidden="true" /> Daily challenge
              </p>
              <h1 id="daily-quiz-title" className="text-2xl font-extrabold tracking-tight text-slate-800">
                Quick Quiz
              </h1>
              <p className="mt-1 text-sm text-slate-500">Five questions. Two minutes. Earn your XP.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close daily quiz"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
          <QuizContainer />
        </div>
      </motion.aside>
    </>
  );
}
