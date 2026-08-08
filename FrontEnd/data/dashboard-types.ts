export interface UserProfile {
  name: string;
  class: string;
  companionName?: string;
  avatarUrl?: string;
  streakDays: number;
  totalXp: number;
}

export interface Activity {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  route: string;
  accentColor: string;
  illustration: string;
  size: 'small' | 'wide';
  // Optional extras for richer cards:
  meta?: {
    unitName?: string;    // e.g., "Web Technology II"
    lessonNumber?: number; // e.g., 4
    totalLessons?: number; // e.g., 12
  };
}

export interface StudySession {
  day: string;
  minutes: number;
  isToday?: boolean;
}

export interface SkillProgress {
  id: string;
  skillName: string;
  Icon: import('lucide-react').LucideIcon;  // ← changed from emoji: string
  grade: string;
  gradeDirection: 'up' | 'down' | 'same';
  rank: string;
  studyTime: number;
  color: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'video' | 'notes' | 'quiz' | 'lesson';
  thumbnail?: string;
  watchedAt: string;
  duration?: string;
  progress?: number;
  color: string;
}
