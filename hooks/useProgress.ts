'use client';
import { useState, useEffect, useCallback } from 'react';
import { UnitProgress } from '@/data/districts-types';
import { Lesson, LessonStatus } from '@/types/lessons-types';

const STORAGE_KEY = 'cs_progress_v1';

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, UnitProgress>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch (e) {
      console.warn('Progress hydration failed', e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, hydrated]);

  const getUnitProgress = useCallback(
    (unitId: string): UnitProgress =>
      progress[unitId] ?? { unitId, completedLessons: [], totalXp: 0 },
    [progress]
  );

  const completeLesson = useCallback((unitId: string, lessonId: string, xp = 10) => {
    setProgress((prev) => {
      const unit = prev[unitId] ?? { unitId, completedLessons: [], totalXp: 0 };
      if (unit.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        [unitId]: {
          ...unit,
          completedLessons: [...unit.completedLessons, lessonId],
          totalXp: unit.totalXp + xp,
        },
      };
    });
  }, []);

  /**
   * 🎯 Reset progress for a specific unit (useful for testing)
   */
  const resetUnit = useCallback((unitId: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[unitId];
      return next;
    });
  }, []);

  /**
   * 🎯 Reset ALL progress (dev/testing helper)
   */
  const resetAll = useCallback(() => {
    setProgress({});
  }, []);

  return {
    getUnitProgress,
    completeLesson,
    resetUnit,
    resetAll,
    hydrated,
  };
}

/**
 * 🧠 Standalone helper to compute a lesson's status based on completed IDs.
 * Not tied to the hook — can be used anywhere.
 */
export function computeLessonStatus(
  lesson: Lesson,
  completedIds: string[]
): LessonStatus {
  if (completedIds.includes(lesson.id)) return 'completed';
  const allPrereqsDone = lesson.prerequisiteIds.every((id:any) =>
    completedIds.includes(id)
  );
  return allPrereqsDone ? 'available' : 'locked';
}