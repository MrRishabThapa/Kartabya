import { LeaderboardEntry } from '@/data/leaderboard-types';

/**
 * 🔢 Sort entries by score (descending) and assign ranks dynamically.
 * Handles ties correctly — two people with the same score get the same rank.
 *
 * Example: [100, 90, 90, 80] → ranks [1, 2, 2, 4]
 */
export function computeRankings(
  entries: Omit<LeaderboardEntry, 'rank'>[]
): LeaderboardEntry[] {
  // Sort by score descending
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  // Assign ranks — same score = same rank (standard "competition ranking")
  let currentRank = 0;
  let previousScore = -Infinity;
  let sameRankCount = 0;

  return sorted.map((entry, index) => {
    if (entry.score !== previousScore) {
      currentRank = index + 1;
      sameRankCount = 0;
    } else {
      sameRankCount++;
    }
    previousScore = entry.score;

    return {
      ...entry,
      rank: currentRank,
    };
  });
}