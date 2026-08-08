'use client';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, ChevronRight } from 'lucide-react';
import { MOCK_SKILLS } from '@/data/dashboard-mock';

export default function YourProgress() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
          Your Progress
        </h2>
        <button className="text-xs font-semibold text-violet-600 hover:text-violet-700">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {MOCK_SKILLS.map((skill, i) => (
          <motion.button
            key={skill.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="w-full flex items-center gap-3 py-3 px-2 rounded-xl
                       hover:bg-slate-50 transition-colors text-left group"
          >
            {/* Skill icon in tinted square */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${skill.color}15` }}
            >
              <skill.Icon
                size={18}
                style={{ color: skill.color }}
                strokeWidth={2}
              />
            </div>

            {/* Name + rank/time */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">
                {skill.skillName}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {skill.rank} · {skill.studyTime} min
              </div>
            </div>

            {/* Grade */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {skill.gradeDirection === 'up' && (
                <ArrowUp size={12} className="text-green-500" strokeWidth={2.5} />
              )}
              {skill.gradeDirection === 'down' && (
                <ArrowDown size={12} className="text-red-500" strokeWidth={2.5} />
              )}
              {skill.gradeDirection === 'same' && (
                <Minus size={12} className="text-slate-400" strokeWidth={2.5} />
              )}
              <span className="text-sm font-extrabold text-slate-800">
                {skill.grade}
              </span>
            </div>

            {/* Chevron */}
            <ChevronRight
              size={16}
              className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0"
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}