'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStudyHistory, getStudyOverview, getStudyTimezone, type StudyDay, type StudyOverview } from '@/lib/study/api';

function fillHistory(days: StudyDay[]) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  const result: StudyDay[] = [];
  const today = new Date();
  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    result.push(byDate.get(key) ?? { date: key, total_seconds: 0, total_minutes: 0, total_hours: 0 });
  }
  return result;
}

export function useStudyDashboard() {
  const [overview, setOverview] = useState<StudyOverview | null>(null);
  const [history, setHistory] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const zone = getStudyTimezone();
      const [nextOverview, nextHistory] = await Promise.all([getStudyOverview(zone), getStudyHistory(30, zone)]);
      setOverview(nextOverview);
      setHistory(fillHistory(Array.isArray(nextHistory) ? nextHistory : []));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Study data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(requestId);
  }, [refresh]);

  return { overview, history, loading, error, refresh };
}
