import type { Metadata } from 'next';
import { GAMES } from '@/data/games';
import GameCard from '@/components/games/GameCard';
import GamesHeader from '@/components/games/GamesHeader';

export const metadata: Metadata = {
  title: 'Games',
  description: 'Learn while you play with quizzes, AI tutors, and multiplayer battles.',
};

export default function GamesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <GamesHeader totalGames={GAMES.length} />

      {/* 🎮 All games in one clean grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-violet-500" />
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
            Featured Games
          </h2>
        </div>

        {/*
          Grid: 2 cols mobile → 3 tablet → 4 desktop
          Cards have aspect-[4/5] so they stay chunky & tile beautifully
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {GAMES.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}