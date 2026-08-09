import { api } from '@/lib/api';

export interface XpStatus {
  total_xp: number;
  rank: number;
}

export interface XpTransaction {
  id: string;
  amount: number;
  reason: string;
  source_type: string;
  source_id: string | null;
  created_at: string;
}

export interface XpLeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_xp: number;
}

export interface XpLeaderboardResponse {
  entries: XpLeaderboardEntry[];
  current_user_rank: number;
  current_user_xp: number;
  limit: number;
  offset: number;
}

export function getXpStatus() {
  return api.get('/api/v1/xp') as Promise<XpStatus>;
}

export function getXpHistory(limit = 50, offset = 0) {
  return api.get(`/api/v1/xp/history?limit=${limit}&offset=${offset}`) as Promise<XpTransaction[]>;
}

export function getXpLeaderboard(limit = 50, offset = 0) {
  return api.get(`/api/v1/xp/leaderboard?limit=${limit}&offset=${offset}`) as Promise<XpLeaderboardResponse>;
}
