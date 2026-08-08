"use client";

import { motion } from "framer-motion";

interface Props {
  text: string;
  selected: boolean;
  correct: boolean;
  showResult: boolean;
  onClick: () => void;
}

export default function QuizOption({
  text,
  selected,
  correct,
  showResult,
  onClick,
}: Props) {
  const base =
    "w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-medium";

  const stateStyle = showResult
    ? correct
      ? "border-green-500 bg-green-50 text-green-700"
      : selected
      ? "border-red-500 bg-red-50 text-red-600"
      : "border-slate-200 text-slate-500"
    : selected
    ? "border-brand-primary-light bg-brand-primary-bg text-brand-primary"
    : "border-slate-200 text-slate-700 hover:border-slate-300";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`${base} ${stateStyle}`}
    >
      {text}
    </motion.button>
  );
}
