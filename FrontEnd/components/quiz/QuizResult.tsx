"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

interface Props {
  score: number;
  total: number;
  passed: boolean;
  passMarkPercent: number;
  xpEarned: number;
  xpPenalty: number;
  totalXp: number;
  onRestart: () => void;
}


export default function QuizResult({ score, total, passed, passMarkPercent, xpEarned, xpPenalty, totalXp, onRestart }: Props) {
  const router = useRouter();
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

      <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${passed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
        {passed ? "Passed" : "Not passed"} · pass mark {passMarkPercent}%
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        +{xpEarned} XP{xpPenalty > 0 ? ` · -${xpPenalty} XP penalty` : ""} · {totalXp} XP total
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onRestart}>Try Again</Button>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>Back to Home</Button>
      </div>
    </motion.div>
  );
}
