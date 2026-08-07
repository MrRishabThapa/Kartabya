import {
  BookOpen,
  Award,
  MessageCircle,
  Gamepad2,
  Sparkles,
  Target,
  Trophy,
  Medal,
  BrainCircuit,
  Zap,
  Swords,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Dashboard nav
  'layout-dashboard': LayoutDashboard,
  'book-open': BookOpen,
  'award': Award,
  'message-circle': MessageCircle,
  'gamepad-2': Gamepad2,
  'trophy': Trophy,
  'medal': Medal,

  // Shared
  'sparkles': Sparkles,

  // Games
  'target': Target,
  'brain-circuit': BrainCircuit,
  'zap': Zap,
  'swords': Swords,
};

export type IconName = keyof typeof ICON_REGISTRY;

export function getIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? BookOpen;
}