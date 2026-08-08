"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizOption from "./QuizOptions";
import Button from "@/components/shared/Button";
import confetti from "canvas-confetti";
import { BackendQuestion } from "@/types/backendQuiz";

interface Props {
  data: BackendQuestion;
  onNext: (correct: boolean, selected: string | null) => void;
}

export default function QuizQuestion({ data, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isCorrect = selected === data.answer;

  const handleCheck = () => {
    setShowResult(true);

    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.h2
        key={data.number}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-slate-800"
      >
        {data.question}
      </motion.h2>

      <div className="space-y-4">
        {data.options.map((option) => (
          <QuizOption
            key={option.option}
            text={option.text}
            selected={selected === option.option}
            correct={option.option === data.answer}
            showResult={showResult}
            onClick={() => {
              if (!showResult) {
                setSelected(option.option);
              }
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl ${
              isCorrect
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            <div className="font-semibold">
              {isCorrect ? "✅ Correct!" : "❌ Not quite."}
            </div>
            <div className="mt-2 text-sm">
              {
                data.options.find(
                  (opt) => opt.option === selected
                )?.description
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        {!showResult ? (
          <Button disabled={!selected} onClick={handleCheck}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={() => onNext(isCorrect, selected)}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
