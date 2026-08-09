import { Brain, Code, Database, Ship } from 'lucide-react';

import {
  UserProfile,
  Activity,
  StudySession,
  SkillProgress,
  HistoryItem,
} from './dashboard-types';

export const MOCK_USER: UserProfile = {
  name: 'Rishab Thapa',
  class: 'Class 12 · Science',
  streakDays: 7,
  totalXp: 1240,
};

// ═══════════════════════════════════════════════════════════
// 🎯 SUGGESTED ACTIVITIES
// ═══════════════════════════════════════════════════════════
export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'next-lesson',
    title: 'Continue Learning',
    subtitle: 'Pick up where you left off',
    ctaLabel: 'Resume',
    // Dynamically points to the next lesson based on user's progress.
    // For now we hardcode — later, this can be computed from useProgress hook.
    route: '/learn/computer-science/web-technology',
    accentColor: '#F27928',
    illustration: '',
    size: 'small',
    meta: {
      unitName: 'Web Technology II',
      lessonNumber: 4,
      totalLessons: 12,
    },
  },
  {
    id: 'minigames',
    title: 'Try Minigames',
    subtitle: 'Learn while you play',
    ctaLabel: 'Play Now',
    route: '/dashboard/games',
    accentColor: '#F97316',
    illustration: '',
    size: 'small',
  },
];

// ═══════════════════════════════════════════════════════════
// 📊 STUDY TIME
// ═══════════════════════════════════════════════════════════
export const MOCK_STUDY_TIME: StudySession[] = [
  { day: 'Sun', minutes: 18 },
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 32 },
  { day: 'Wed', minutes: 39, isToday: true },
  { day: 'Thu', minutes: 0 },
  { day: 'Fri', minutes: 0 },
  { day: 'Sat', minutes: 0 },
];

// ═══════════════════════════════════════════════════════════
// 📈 SKILL PROGRESS — using lucide icons now
// ═══════════════════════════════════════════════════════════
export const MOCK_SKILLS: SkillProgress[] = [
  {
    id: 'logic',
    skillName: 'Logic & Reasoning',
    Icon: Brain,
    grade: 'A+',
    gradeDirection: 'up',
    rank: 'Top 10%',
    studyTime: 243,
    color: '#22C55E',
  },
  {
    id: 'programming',
    skillName: 'Programming in C',
    Icon: Code,
    grade: 'A',
    gradeDirection: 'up',
    rank: 'Top 25%',
    studyTime: 187,
    color: '#F97316',
  },
  {
    id: 'database',
    skillName: 'Database',
    Icon: Database,
    grade: 'B+',
    gradeDirection: 'same',
    rank: 'Top 40%',
    studyTime: 124,
    color: '#3B82F6',
  },
  {
    id: 'web',
    skillName: 'Web Technology',
    Icon: Ship,
    grade: 'A-',
    gradeDirection: 'up',
    rank: 'Top 30%',
    studyTime: 156,
    color: '#F5A623',
  },
];

// ═══════════════════════════════════════════════════════════
// 🕐 RECENT HISTORY
// ═══════════════════════════════════════════════════════════
export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    title: 'HTML Fundamentals',
    subtitle: 'Web Technology II',
    type: 'video',
    watchedAt: '2h ago',
    duration: '15 min',
    progress: 100,
    color: '#F5A623',
  },
  {
    id: 'h2',
    title: 'Pointers in C',
    subtitle: 'Programming in C',
    type: 'lesson',
    watchedAt: 'Yesterday',
    duration: '30 min',
    progress: 65,
    color: '#DC7B4A',
  },
  {
    id: 'h3',
    title: 'SQL Basics Quiz',
    subtitle: 'Database',
    type: 'quiz',
    watchedAt: '2 days ago',
    duration: '5 min',
    progress: 100,
    color: '#60A5FA',
  },
  {
    id: 'h4',
    title: 'OSI Model Notes',
    subtitle: 'Networking',
    type: 'notes',
    watchedAt: '3 days ago',
    color: '#2DD4BF',
  },
];
