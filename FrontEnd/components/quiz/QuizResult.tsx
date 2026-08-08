"use client";

import { motion } from "framer-motion";
import Button from "@/components/shared/Button";

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
}


export default function QuizResult({ score, total, onRestart }: Props) {
  const percentage = Math.round((score / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
    >
      <h2 className="text-3xl font-bold text-slate-800">
        Quiz Complete 🎉
      </h2>

      <div className="text-xl text-slate-600">
        You scored{" "}
        <span className="font-bold text-brand-primary">
          {score} / {total}
        </span>
      </div>

      <div className="text-4xl font-bold text-brand-primary">
        {percentage}%
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        +{score * 10} XP added to your leaderboard score
      </div>

      <Button onClick={onRestart}>
        Try Again
      </Button>
    </motion.div>
  );
}
