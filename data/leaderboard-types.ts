export type LeaderboardPeriod = 'week' | 'month' | 'all-time';
export type LeaderboardScope = 'class' | 'school' | 'global';

/**
 * 📌 Raw entry — no rank field required.
 * Rank gets computed dynamically from scores.
 */
export interface LeaderboardEntryInput {
  id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  scoreUnit: string;
  isCurrentUser?: boolean;
  streak?: number;
}

/**
 * 📌 Final entry — includes computed rank.
 */
export interface LeaderboardEntry extends LeaderboardEntryInput {
  rank: number;
}

export interface LeaderboardData {
  title: string;
  subtitle: string;
  period: LeaderboardPeriod;
  scope: LeaderboardScope;
  entries: LeaderboardEntryInput[];  // ← input format (no rank)
}