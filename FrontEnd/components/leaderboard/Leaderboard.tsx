'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LeaderboardData } from '@/data/leaderboard-types';
import { computeRankings } from '@/lib/leaderboard-utils';
import LeaderboardPodium from './LeaderboardPodium';
import LeaderboardRow from './LeaderboardRow';

interface Props {
  data: LeaderboardData;
}

export default function Leaderboard({ data }: Props) {
  const router = useRouter();

  // 🎯 Compute ranks dynamically from scores
  const rankedEntries = useMemo(
    () => computeRankings(data.entries),
    [data.entries]
  );

  const podiumEntries = rankedEntries.filter((e) => e.rank <= 3);
  const listEntries = rankedEntries.filter((e) => e.rank > 3);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-3xl overflow-hidden
                   bg-gradient-to-b from-violet-600 via-violet-700 to-purple-900
                   px-4 md:px-8 pt-6 md:pt-8 pb-10 md:pb-14"
      >
        {/* Decorative glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48
                        bg-white/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-32
                        bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/15 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" strokeWidth={2.5} />
          </button>
          <div className="flex-1 text-center">
            <p className="text-white/90 text-sm md:text-base font-semibold">
              {data.subtitle}
            </p>
          </div>
          <div className="w-9" />
        </div>

        {/* Title */}
        <h1 className="relative text-center text-white text-2xl md:text-4xl font-extrabold
                       tracking-tight drop-shadow-lg">
          {data.title}
        </h1>

        {/* Podium */}
        <div className="relative">
          <LeaderboardPodium entries={podiumEntries} />
        </div>
      </motion.div>

      {/* List */}
      <div className="mt-4 md:mt-6 space-y-2">
        {listEntries.map((entry, i) => (
          <LeaderboardRow key={entry.id} entry={entry} index={i} />
        ))}
      </div>
    </div>
  );
}