'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LeaderboardEntry } from '@/data/leaderboard-types';

interface Props {
  entry: LeaderboardEntry;
  index: number;
}

/**
 * 🎨 Gradient progression based on rank position (like the reference)
 * Ranks 4-10+ get a soft warm gradient that shifts hue as rank goes down
 */
function getRowGradient(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return 'from-brand-primary-tint/70 to-brand-primary-bg border-brand-primary-light';
  }

  // Gradient shifts from soft yellow → orange → coral as rank descends
  const gradients = [
    'from-slate-50 to-orange-50',       // rank 4
    'from-slate-50 to-orange-50',       // rank 5
    'from-slate-50 to-orange-50',       // rank 6
    'from-slate-50 to-orange-50',       // rank 7
    'from-slate-50 to-orange-50',       // rank 8
    'from-slate-50 to-orange-50',       // rank 9
    'from-slate-50 to-orange-50',       // rank 10+
  ];

  const index = Math.min(rank - 4, gradients.length - 1);
  return `${gradients[index]} border-transparent`;
}

const RANK_LABEL = (rank: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

export default function LeaderboardRow({ entry, index }: Props) {
  const gradientClass = getRowGradient(entry.rank, !!entry.isCurrentUser);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`
        relative flex items-center gap-3 md:gap-4
        px-3 md:px-4 py-3 md:py-3.5
        rounded-2xl border
        bg-gradient-to-r ${gradientClass}
        hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer
      `}
    >
      {/* Avatar */}
      <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden
                      bg-white flex-shrink-0 shadow-sm">
        {entry.avatarUrl ? (
          <Image
            src={entry.avatarUrl}
            alt={entry.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="text-sm md:text-base font-extrabold text-slate-500">
              {entry.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Rank + Name */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] md:text-xs font-bold text-slate-500">
          {RANK_LABEL(entry.rank)} Place
        </p>
        <p className="text-sm md:text-base font-extrabold text-slate-800 truncate">
          {entry.name}
          {entry.isCurrentUser && (
            <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
              You
            </span>
          )}
        </p>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm md:text-base font-extrabold text-slate-800 tabular-nums">
          {entry.score.toLocaleString()}
        </p>
        <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {entry.scoreUnit}
        </p>
      </div>
    </motion.div>
  );
}
