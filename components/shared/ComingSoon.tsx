'use client';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardCheck,
  Award,
  MessageCircle,
  Gamepad2,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

// 🗺️ Icon registry — maps string names to actual icon components.
// Client side owns this so server components don't need to pass functions.
const ICON_MAP: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'clipboard-check': ClipboardCheck,
  'award': Award,
  'message-circle': MessageCircle,
  'gamepad-2': Gamepad2,
  'target': Target,
  'trophy': Trophy,
};

export type ComingSoonIconName = keyof typeof ICON_MAP;

interface Feature {
  title: string;
  description: string;
}

interface Props {
  iconName: ComingSoonIconName;
  accentColor: string;
  title: string;
  description: string;
  releaseHint?: string;
  features?: Feature[];
}

export default function ComingSoon({
  iconName,
  accentColor,
  title,
  description,
  releaseHint = 'Coming soon',
  features = [],
}: Props) {
  const Icon = ICON_MAP[iconName] ?? BookOpen;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 text-center"
      >
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon size={30} style={{ color: accentColor }} strokeWidth={2} />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          {title}
        </h1>

        <div
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
          }}
        >
          <Sparkles size={12} strokeWidth={2.5} />
          {releaseHint}
        </div>

        <p className="mt-5 text-slate-500 text-sm md:text-base leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </motion.div>

      {features.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5"
            >
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
                {f.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}