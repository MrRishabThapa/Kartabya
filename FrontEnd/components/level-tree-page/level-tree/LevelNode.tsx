'use client';
import { motion } from 'framer-motion';
import { Check, Lock, BookOpen, Gift, Flag, Trophy, Play } from 'lucide-react';
import { Lesson, LessonStatus, LessonType } from '@/types/lessons-types';

interface Props {
  lesson: Lesson;
  status: LessonStatus;
  isCurrent: boolean;         // The next available lesson to do
  unitColor: string;
  unitAccentColor: string;
  onClick: (lesson: Lesson) => void;
  x: number;                  // Position (px)
  y: number;                  // Position (px)
}

// Icon per lesson type
const TYPE_ICONS: Record<LessonType, typeof BookOpen> = {
  lesson: BookOpen,
  bonus: Gift,
  checkpoint: Flag,
  boss: Trophy,
};

export default function LevelNode({
  lesson,
  status,
  isCurrent,
  unitColor,
  unitAccentColor,
  onClick,
  x,
  y,
}: Props) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const TypeIcon = TYPE_ICONS[lesson.type];

  // Node color logic
  const nodeColor = isLocked
    ? '#CBD5E1'                                        // slate-300 for locked
    : lesson.type === 'boss'
      ? '#EF4444'                                      // red for boss
      : lesson.type === 'checkpoint'
        ? '#8B5CF6'                                    // violet for checkpoint
        : lesson.type === 'bonus'
          ? '#F59E0B'                                  // amber for bonus
          : unitColor;                                 // unit color for normal

  const nodeAccent = isLocked
    ? '#94A3B8'                                        // slate-400
    : lesson.type === 'boss'
      ? '#B91C1C'
      : lesson.type === 'checkpoint'
        ? '#6D28D9'
        : lesson.type === 'bonus'
          ? '#B45309'
          : unitAccentColor;

  // Icon to show inside node
  const NodeIcon = isCompleted ? Check : isLocked ? Lock : TypeIcon;

  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: lesson.order * 0.06,
        type: 'spring',
        damping: 15,
        stiffness: 200,
      }}
    >
      {/* Pulsing halo for current lesson */}
      {isCurrent && !isLocked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: nodeColor }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* "START" label for current lesson */}
      {isCurrent && !isLocked && !isCompleted && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -top-10
                     px-3 py-1 rounded-full text-xs font-extrabold
                     bg-white text-slate-800 shadow-lg
                     whitespace-nowrap border-2"
          style={{ borderColor: nodeColor }}
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          START
          {/* Little triangle pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1
                       w-2 h-2 rotate-45 bg-white border-r-2 border-b-2"
            style={{ borderColor: nodeColor }}
          />
        </motion.div>
      )}

      {/* 3D Button — the coin */}
      <button
        onClick={() => !isLocked && onClick(lesson)}
        disabled={isLocked}
        className={`
          relative group
          w-16 h-16 md:w-20 md:h-20
          rounded-full
          flex items-center justify-center
          transition-all duration-100
          ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${!isLocked ? 'hover:-translate-y-0.5 active:translate-y-1' : ''}
        `}
        style={{
          backgroundColor: nodeColor,
          boxShadow: isLocked
            ? `0 4px 0 ${nodeAccent}`
            : `0 6px 0 ${nodeAccent}`,
        }}
        aria-label={lesson.title}
      >
        {/* Inner icon */}
        <NodeIcon
          size={28}
          className="text-white drop-shadow-sm"
          strokeWidth={3}
        />

        {/* Subtle inner glow when hoverable */}
        {!isLocked && (
          <div className="absolute inset-1 rounded-full bg-white/10 pointer-events-none" />
        )}

        {/* Play triangle overlay for current lesson */}
        {isCurrent && !isCompleted && !isLocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white
                          flex items-center justify-center shadow-md">
            <Play size={12} className="text-slate-800 ml-0.5" fill="currentColor" />
          </div>
        )}
      </button>

      {/* XP badge for bonus/boss lessons */}
      {(lesson.type === 'bonus' || lesson.type === 'boss') && !isLocked && (
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2
                     px-2 py-0.5 rounded-full text-[10px] font-extrabold
                     bg-white text-slate-800 shadow-md whitespace-nowrap"
        >
          +{lesson.xpReward} XP
        </div>
      )}
    </motion.div>
  );
}