'use client';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface Props {
  days: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakFlame({ days, size = 'md' }: Props) {
  const sizes = {
    sm: { icon: 14, text: 'text-xs' },
    md: { icon: 18, text: 'text-sm' },
    lg: { icon: 22, text: 'text-base' },
  };
  const s = sizes[size];

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5
                    rounded-full bg-gradient-to-br from-orange-400 to-red-500
                    shadow-lg shadow-orange-500/30">
      {/* Animated flame */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame
          size={s.icon}
          className="text-white"
          fill="currentColor"
          strokeWidth={2}
        />
      </motion.div>
      <span className={`font-extrabold text-white ${s.text}`}>
        {days} day{days !== 1 ? 's' : ''}
      </span>
    </div>
  );
}