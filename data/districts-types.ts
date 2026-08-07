import { LucideIcon } from 'lucide-react';
export interface District {
  id: string;
  name: string;
  courseTitle: string;
  description: string;
  color: string;
  glowColor: string;
  polygonPoints: string;
  centerCoords: { x: number; y: number };
  totalLessons: number;
  route: string;
  Icon: LucideIcon;   // ← was `icon: string`
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  type: 'lesson' | 'bonus' | 'checkpoint';
  status: 'locked' | 'available' | 'completed';
  videoUrl?: string;
  notesUrl?: string;
  hasQuiz: boolean;
  xpReward: number;
  prerequisiteIds: string[];
  thumbnail?: string;
}

export interface UnitProgress {
  unitId: string;
  completedLessons: string[];
  totalXp: number;
}