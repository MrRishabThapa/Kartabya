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
    return 'from-violet-100 to-violet-50 border-violet-300';
  }

  // Gradient shifts from soft yellow → orange → coral as rank descends
  const gradients = [
    'from-amber-50 to-orange-50',       // rank 4
    'from-orange-50 to-orange-100',     // rank 5
    'from-orange-100 to-orange-200',    // rank 6
    'from-orange-200 to-red-100',       // rank 7
    'from-red-100 to-rose-100',         // rank 8
    'from-rose-100 to-pink-100',        // rank 9
    'from-pink-100 to-pink-200',        // rank 10+
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
        px-3 md:px-4 py-2.5 md:py-3
        rounded-2xl border
        bg-gradient-to-r ${gradientClass}
        hover:shadow-md transition-shadow cursor-pointer
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
        <p className="text-[11px] md:text-xs font-bold text-slate-600">
          {RANK_LABEL(entry.rank)} Place
        </p>
        <p className="text-sm md:text-base font-extrabold text-slate-800 truncate">
          {entry.name}
          {entry.isCurrentUser && (
            <span className="ml-2 text-[10px] font-bold text-violet-600 uppercase
                             tracking-wider">
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