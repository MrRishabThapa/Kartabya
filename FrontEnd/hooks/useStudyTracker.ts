'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  getActiveStudySession,
  heartbeatStudySession,
  pauseStudySession,
  resumeStudySession,
  startStudySession,
  stopStudySession,
  type StudySession,
} from '@/lib/study/api';

type TrackerAction = 'starting' | 'pausing' | 'resuming' | 'stopping' | 'heartbeat' | null;

function unwrapActive(value: StudySession | { session?: StudySession | null; active_session?: StudySession | null } | null): StudySession | null {
  if (!value) return null;
  if (typeof value === 'object' && ('session' in value || 'active_session' in value)) return value.session ?? value.active_session ?? null;
  return value as StudySession;
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) return 'An existing study session was restored.';
  return error instanceof Error ? error.message : 'Study tracking is temporarily unavailable.';
}

export function useStudyTracker({ lessonId, subject, title }: { lessonId?: string; subject?: string; title?: string }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [action, setAction] = useState<TrackerAction>('starting');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<StudySession | null>(null);
  const hiddenPauseRef = useRef(false);
  const stopTimerRef = useRef<number | null>(null);
  const stopSentRef = useRef(false);
  const initializedRef = useRef(false);
  const mountedRef = useRef(false);

  const applySession = useCallback((next: StudySession | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) setElapsedSeconds(next.duration_seconds);
  }, []);

  const initialize = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    setAction('starting');
    try {
      const active = unwrapActive(await getActiveStudySession());
      if (active) {
        if (!mountedRef.current) {
          await stopStudySession(active.id).catch(() => undefined);
          return;
        }
        applySession(active);
        return;
      }
      const started = await startStudySession({ lesson_id: lessonId, subject, title });
      if (!mountedRef.current) {
        await stopStudySession(started.id).catch(() => undefined);
        return;
      }
      applySession(started);
    } catch (startError) {
      if (startError instanceof ApiError && startError.status === 409) {
        try {
          const restored = unwrapActive(await getActiveStudySession());
          if (!mountedRef.current) {
            if (restored) await stopStudySession(restored.id).catch(() => undefined);
            return;
          }
          applySession(restored);
        } catch (restoreError) {
          setError(errorMessage(restoreError));
        }
      } else {
        setError(errorMessage(startError));
      }
    } finally {
      setAction(null);
    }
  }, [applySession, lessonId, subject, title]);

  const pause = useCallback(async (fromVisibility = false) => {
    const current = sessionRef.current;
    if (!current || current.status !== 'ACTIVE') return;
    setAction('pausing');
    try {
      applySession(await pauseStudySession(current.id));
      hiddenPauseRef.current = fromVisibility;
    } catch (pauseError) {
      setError(errorMessage(pauseError));
    } finally {
      setAction(null);
    }
  }, [applySession]);

  const resume = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || current.status !== 'PAUSED') return;
    setAction('resuming');
    try {
      applySession(await resumeStudySession(current.id));
      hiddenPauseRef.current = false;
    } catch (resumeError) {
      setError(errorMessage(resumeError));
    } finally {
      setAction(null);
    }
  }, [applySession]);

  const stop = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || stopSentRef.current || current.status === 'COMPLETED' || current.status === 'CANCELLED') return;
    stopSentRef.current = true;
    setAction('stopping');
    try {
      applySession(await stopStudySession(current.id));
    } catch (stopError) {
      // A repeated stop is idempotent from the user's perspective.
      if (!(stopError instanceof ApiError && [404, 409].includes(stopError.status))) setError(errorMessage(stopError));
    } finally {
      setAction(null);
    }
  }, [applySession]);

  useEffect(() => {
    mountedRef.current = true;
    if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
    const initializeTimer = window.setTimeout(() => void initialize(), 0);
    return () => {
      mountedRef.current = false;
      window.clearTimeout(initializeTimer);
      if (stopTimerRef.current !== null) window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = window.setTimeout(() => void stop(), 0);
    };
  }, [initialize, stop]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) void pause(true);
      else if (hiddenPauseRef.current) void resume();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pause, resume]);

  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;
    const heartbeat = window.setInterval(() => {
      if (document.hidden || !sessionRef.current || sessionRef.current.status !== 'ACTIVE') return;
      void heartbeatStudySession(sessionRef.current.id)
        .then(applySession)
        .catch((heartbeatError: unknown) => setError(errorMessage(heartbeatError)));
    }, 30000);
    return () => window.clearInterval(heartbeat);
  }, [applySession, session]);

  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  const retry = useCallback(async () => {
    initializedRef.current = false;
    setError(null);
    await initialize();
  }, [initialize]);

  return { session, elapsedSeconds, action, error, pause, resume, stop, retry };
}
