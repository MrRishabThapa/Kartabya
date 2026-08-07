'use client';
import { ArrowLeft, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Unit } from '@/types/lessons-types';
import { useProgress } from '@/hooks/useProgress';

interface Props {
  unit: Unit;
}

export default function LevelTreeHeader({ unit }: Props) {
  const router = useRouter();
  const { getUnitProgress } = useProgress();
  const progress = getUnitProgress(unit.id);

  const totalLessons = unit.lessons.length;
  const completedCount = progress.completedLessons.length;
  const pct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.push('/learn')}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Back to map"
          >
            <ArrowLeft size={20} className="text-slate-700" strokeWidth={2.5} />
          </button>

          {/* Unit info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-extrabold text-slate-800 truncate">
              {unit.courseTitle}
            </h1>
            <p className="text-xs text-slate-500 truncate">{unit.title}</p>
          </div>

          {/* XP counter */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full
                          bg-amber-50 border border-amber-200">
            <Zap size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-extrabold text-amber-700">
              {progress.totalXp}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: unit.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 tabular-nums">
            {completedCount}/{totalLessons}
          </span>
        </div>
      </div>
    </div>
  );
}