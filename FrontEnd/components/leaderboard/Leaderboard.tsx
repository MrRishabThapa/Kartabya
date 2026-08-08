'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Sparkles, Target, Trophy, Users, Zap } from 'lucide-react';
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
  const currentUser = rankedEntries.find((entry) => entry.isCurrentUser);
  const topScore = rankedEntries[0]?.score ?? 0;
  const averageScore = rankedEntries.length
    ? Math.round(rankedEntries.reduce((total, entry) => total + entry.score, 0) / rankedEntries.length)
    : 0;

  return (
    <div className="w-full pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-[2rem] overflow-hidden
                   bg-[#29211f] px-5 md:px-8 lg:px-10 pt-5 md:pt-7 pb-8 md:pb-10
                   shadow-[0_24px_70px_-32px_rgba(157,79,26,0.7)]"
      >
        {/* Abstract atmosphere */}
        <div className="absolute -top-32 -right-16 h-80 w-80 rounded-full bg-brand-primary/35 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 left-1/4 h-72 w-72 rounded-full bg-[#ffb15c]/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 top-20 h-32 w-32 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute right-[23%] top-[4.5rem] h-20 w-20 rounded-full border border-brand-primary-light/20 pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-light"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]" />
            Live rankings
          </div>
          <div className="w-10" />
        </div>

        {/* Title */}
        <div className="relative mt-7 flex flex-col items-center text-center">
          <p className="mb-2 text-sm font-semibold text-orange-100/75">{data.subtitle}</p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{data.title}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/60">Small steps, big momentum. See who is shaping this month&apos;s learning streak.</p>
        </div>

        {/* Podium */}
        <div className="relative">
          <LeaderboardPodium entries={podiumEntries} />
        </div>
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5" aria-labelledby="rankings-heading">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">The full field</p>
              <h2 id="rankings-heading" className="mt-1 text-xl font-black tracking-tight text-slate-800">Keep climbing</h2>
            </div>
            <div className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
              <Users size={14} /> {rankedEntries.length} learners
            </div>
          </div>
          <div className="space-y-2">
            {listEntries.map((entry, i) => (
              <LeaderboardRow key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-primary p-5 text-white shadow-sm">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[16px] border-white/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100">Your standing</p>
                <Target size={18} className="text-orange-100" />
              </div>
              {currentUser ? (
                <>
                  <p className="mt-5 text-5xl font-black tracking-tight">#{currentUser.rank}</p>
                  <p className="mt-1 text-sm font-semibold text-orange-100">{currentUser.score.toLocaleString()} XP earned</p>
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-xs font-semibold text-orange-50">
                    <Flame size={15} /> {currentUser.streak ?? 0} day learning streak
                  </div>
                </>
              ) : (
                <p className="mt-5 text-sm text-orange-100">Start learning to join the rankings.</p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-bg text-brand-primary"><Sparkles size={17} /></div>
              <div>
                <p className="text-sm font-black text-slate-800">This month&apos;s pulse</p>
                <p className="text-xs text-slate-400">A quick look at the room</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Top score" value={`${(topScore / 1000).toFixed(1)}k`} icon={Trophy} />
              <Metric label="Avg. XP" value={`${(averageScore / 1000).toFixed(1)}k`} icon={Zap} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Trophy }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon size={15} className="mb-2 text-brand-primary" />
      <p className="text-lg font-black tabular-nums text-slate-800">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}
