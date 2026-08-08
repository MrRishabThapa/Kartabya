import { LucideIcon } from 'lucide-react';

export type LessonStatus = 'locked' | 'available' | 'completed';
export type LessonType = 'lesson' | 'bonus' | 'checkpoint' | 'boss';

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  videoUrl?: string;
  notesUrl?: string;
  hasQuiz: boolean;
  xpReward: number;
  prerequisiteIds: string[]; // IDs of lessons that must be completed first
  thumbnail?: string;
  estimatedMinutes?: number;
}

export interface Unit {
  id: string;
  title: string;
  courseTitle: string;
  color: string;              // Primary theme color for this unit
  accentColor: string;        // Darker variant for shadows/borders
  lessons: Lesson[];
}