import { Game } from './games-types';

export const GAMES: Game[] = [
  {
    id: 'daily-quiz',
    title: 'Daily Quiz',
    tagline: '5 questions · 2 min',
    description:
      'Every day, a fresh quiz drops with 5 questions across your subjects. Answer quickly for bonus XP and climb the daily leaderboard.',
    iconName: 'target',
    // 🎨 Visual identity
    gradient: 'from-orange-400 via-orange-500 to-red-500',
    graphic: '🎯',
    stat: { label: 'players', value: '12k' },
    status: 'coming-soon',
    difficulty: 'all-levels',
    estimatedMinutes: 2,
    xpReward: 50,
    isNew: true,
    bannerSrc: '/assets/games/daily-quiz.png',
  },
  {
    id: 'concept-coach',
    title: 'Teach Your Companion',
    tagline: 'Teach the AI',
    description:
      'Pick any concept and explain it to an AI tutor. Get graded on accuracy, clarity, and completeness. The best way to master a topic is to teach it.',
    iconName: 'brain-circuit',
    gradient: 'from-brand-primary via-brand-primary-dark to-brand-primary-darker',
    graphic: '🧠',
    stat: { label: 'players', value: '8k' },
    status: 'coming-soon',
    difficulty: 'all-levels',
    estimatedMinutes: 8,
    xpReward: 100,
    isNew: true,
    bannerSrc: '/assets/games/teach-your-companion.png.png',
  },
  {
    id: 'flashcard-duel',
    title: 'Duel',
    tagline: '1v1 battles',
    description:
      'Match against a friend or random opponent in a race to answer flashcards. First to 10 correct wins. Pick your subject or mix them all.',
    iconName: 'swords',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    graphic: '⚔️',
    stat: { label: 'online', value: '8.4k' },
    status: 'available',
    route: '/games/duel',
    difficulty: 'all-levels',
    estimatedMinutes: 5,
    xpReward: 80,
    isNew: true,
    bannerSrc: '/assets/games/duel.png',
  },
];
