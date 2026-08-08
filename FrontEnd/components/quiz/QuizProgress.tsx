"use client";

import { motion } from "framer-motion";

interface Props {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: Props) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-slate-500">
        <span>
          Question {current} of {total}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>

      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
