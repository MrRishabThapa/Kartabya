'use client';
import { motion } from 'framer-motion';
import { PlayCircle, FileText, HelpCircle, BookOpen, Clock } from 'lucide-react';
import { MOCK_HISTORY } from '@/data/dashboard-mock';
import { HistoryItem } from '@/data/dashboard-types';

const TYPE_META = {
  video: { icon: PlayCircle, label: 'Video' },
  notes: { icon: FileText, label: 'Notes' },
  quiz: { icon: HelpCircle, label: 'Quiz' },
  lesson: { icon: BookOpen, label: 'Lesson' },
};

export default function RecentHistory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
          Recent History
        </h2>
        <button className="text-xs font-semibold text-violet-600 hover:text-violet-700">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {MOCK_HISTORY.map((item:any, i:any) => (
          <HistoryRow key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function HistoryRow({ item, index }: { item: HistoryItem; index: number }) {
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
      className="w-full flex items-center gap-3 py-3 px-2 rounded-xl
                 hover:bg-slate-50 transition-colors text-left"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${item.color}15` }}
      >
        <Icon size={18} style={{ color: item.color }} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800 truncate">
          {item.title}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
          <span>{item.subtitle}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock size={10} />
            {item.watchedAt}
          </span>
        </div>
      </div>

      {/* Type label */}
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
        {meta.label}
      </span>
    </motion.button>
  );
}