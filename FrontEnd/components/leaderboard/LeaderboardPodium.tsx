'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LeaderboardEntry } from '@/data/leaderboard-types';
import Medal from './Medal';

interface Props {
  entries: LeaderboardEntry[];
}

/**
 * 🎨 Color palette per rank — gold / silver / bronze
 * Used for ALL text (name, place, score) so each podium spot has a clear identity
 */
const RANK_THEME = {
  1: {
    medalColor: '#FBBF24',
    ringColor: '#FBBF24',
    textColor: '#FBBF24',           // gold
    scoreColor: '#FCD34D',          // lighter gold
    avatarSize: 'w-24 h-24 md:w-28 md:h-28',
    medalSize: 68,
    nameSize: 'text-base md:text-2xl',
  },
  2: {
    medalColor: '#E5E7EB',
    ringColor: '#E5E7EB',
    textColor: '#F3F4F6',           // silver/white
    scoreColor: '#E5E7EB',
    avatarSize: 'w-20 h-20 md:w-24 md:h-24',
    medalSize: 56,
    nameSize: 'text-sm md:text-xl',
  },
  3: {
    medalColor: '#D97706',
    ringColor: '#D97706',
    textColor: '#F59E0B',           // bronze
    scoreColor: '#FBBF24',
    avatarSize: 'w-20 h-20 md:w-24 md:h-24',
    medalSize: 56,
    nameSize: 'text-sm md:text-lg',
  },
};

const RANK_LABEL = {
  1: '1st Place',
  2: '2nd Place',
  3: '3rd Place',
};

export default function LeaderboardPodium({ entries }: Props) {
  const second = entries.find((e) => e.rank === 2);
  const first = entries.find((e) => e.rank === 1);
  const third = entries.find((e) => e.rank === 3);

  if (!first) return null;

  return (
    <div className="grid grid-cols-3 items-end gap-2 md:gap-4 py-8 md:py-10">
      {second && <PodiumSpot entry={second} delay={0.1} />}
      {first && <PodiumSpot entry={first} delay={0} />}
      {third && <PodiumSpot entry={third} delay={0.2} />}
    </div>
  );
}

function PodiumSpot({ entry, delay }: { entry: LeaderboardEntry; delay: number }) {
  const t = RANK_THEME[entry.rank as 1 | 2 | 3];
  const label = RANK_LABEL[entry.rank as 1 | 2 | 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: 'spring', damping: 18 }}
      className="flex flex-col items-center"
    >
      {/* Avatar with colored ring */}
      <div className="relative">
        <div
          className={`${t.avatarSize} rounded-full p-1 bg-white`}
          style={{
            boxShadow: `0 0 0 4px ${t.ringColor}, 0 8px 20px -4px rgba(0,0,0,0.2)`,
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100
                          flex items-center justify-center">
            {entry.avatarUrl ? (
              <Image
                src={entry.avatarUrl}
                alt={entry.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-3xl md:text-4xl font-extrabold text-slate-400">
                {entry.name.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Medal (overlapping avatar bottom slightly) */}
      <div className="-mt-4 md:-mt-5 z-10">
        <Medal rank={entry.rank as 1 | 2 | 3} size={t.medalSize} />
      </div>

      {/* Placement label */}
      <p
        className="mt-2 text-sm md:text-base font-extrabold uppercase tracking-wide"
        style={{ color: t.textColor }}
      >
        {label}
      </p>

      {/* Name */}
      <p
        className={`mt-1 ${t.nameSize} font-extrabold text-white text-center leading-tight
                    truncate max-w-full px-1 drop-shadow-md`}
      >
        {entry.name}
      </p>

      {/* Score and current-user marker */}
      <div className="mt-1 flex items-center justify-center gap-2">
        <p
          className="text-sm md:text-base font-bold tabular-nums"
          style={{ color: t.scoreColor }}
        >
          {entry.score.toLocaleString()} {entry.scoreUnit}
        </p>
        {entry.isCurrentUser && (
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            You
          </span>
        )}
      </div>
    </motion.div>
  );
}
