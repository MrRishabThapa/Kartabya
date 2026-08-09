import { api } from '@/lib/api';

export type StudySessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface StudySession {
  id: string;
  lesson_id: string | null;
  subject: string | null;
  title: string | null;
  status: StudySessionStatus;
  duration_seconds: number;
  started_at?: string | null;
  ended_at?: string | null;
  last_heartbeat_at?: string | null;
  duration_minutes?: number;
  duration_hours?: number;
}

export interface StudyDay {
  date: string;
  total_seconds: number;
  total_minutes: number;
  total_hours: number;
  session_count?: number;
}

export interface StudyOverview {
  today: StudyDay;
  this_week: StudyDay;
  this_month: StudyDay;
  active_session?: StudySession | null;
}

function timezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getStudyTimezone() {
  return timezone();
}

export function getActiveStudySession() {
  return api.get('/api/v1/study/sessions/active') as Promise<StudySession | { session?: StudySession | null; active_session?: StudySession | null } | null>;
}

export function startStudySession(payload: { lesson_id?: string; subject?: string; title?: string }) {
  const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''));
  return api.post('/api/v1/study/sessions', body) as Promise<StudySession>;
}

export function heartbeatStudySession(sessionId: string) {
  return api.post(`/api/v1/study/sessions/${encodeURIComponent(sessionId)}/heartbeat`) as Promise<StudySession>;
}

export function pauseStudySession(sessionId: string) {
  return api.post(`/api/v1/study/sessions/${encodeURIComponent(sessionId)}/pause`) as Promise<StudySession>;
}

export function resumeStudySession(sessionId: string) {
  return api.post(`/api/v1/study/sessions/${encodeURIComponent(sessionId)}/resume`) as Promise<StudySession>;
}

export function stopStudySession(sessionId: string) {
  return api.post(`/api/v1/study/sessions/${encodeURIComponent(sessionId)}/stop`) as Promise<StudySession>;
}

export function getStudyOverview(zone = timezone()) {
  return api.get(`/api/v1/study/overview?timezone=${encodeURIComponent(zone)}`) as Promise<StudyOverview>;
}

export function getStudyHistory(days = 30, zone = timezone()) {
  return api.get(`/api/v1/study/history?days=${days}&timezone=${encodeURIComponent(zone)}`) as Promise<StudyDay[]>;
}
