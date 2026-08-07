export type GameStatus = 'available' | 'coming-soon' | 'beta';
export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'all-levels';

export interface Game {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;

  // 🎨 Visual identity
  gradient: string;                 // Tailwind gradient classes
  graphic: string;                  // Emoji or path to image
  stat?: { label: string; value: string };

  // 📊 Metadata
  status: GameStatus;
  difficulty: GameDifficulty;
  estimatedMinutes: number;
  xpReward: number;
  isNew?: boolean;
  route?: string;
}