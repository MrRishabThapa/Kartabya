"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuizQuestion from "./QuizQuestion";
import QuizProgress from "./QuizProgress";
import QuizResult from "./QuizResult";

import ErrorState from "@/components/shared/ErrorState";
import { BackendQuestion } from "@/types/backendQuiz";
import QuizSkeletonContent from "./QuizSkeletonContent";

export default function QuizContainer() {
  const [quizData, setQuizData] = useState<BackendQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "Quiz",
            number_of_qns: 5,
            user_interest: "piano",
            subject: "Chemistry",
            content: "organic_chemistry",
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.detail);

        setQuizData(data.questions);
      } catch (err: any) {
        setError(err.message || "Quiz generation failed.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, []);

  const handleNext = (correct: boolean) => {
    if (correct) setScore((prev) => prev + 1);

    if (index < quizData.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 md:p-10 space-y-8 transition-all duration-300">
          {loading ? (
            <QuizSkeletonContent />
          ) : error ? (
            <ErrorState
              subtitle={error}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <>
              {!finished && (
                <QuizProgress current={index + 1} total={quizData.length} />
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={finished ? "result" : index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!finished ? (
                    <QuizQuestion data={quizData[index]} onNext={handleNext} />
                  ) : (
                    <QuizResult
                      score={score}
                      total={quizData.length}
                      onRestart={handleRestart}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <ErrorState
          title="Something went wrong."
          subtitle={error || "Quiz generation failed."}
          onRetry={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-8">
      {!finished && (
        <QuizProgress current={index + 1} total={quizData.length} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={finished ? "result" : quizData[index]?.number}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {!finished ? (
            <QuizQuestion data={quizData[index]} onNext={handleNext} />
          ) : (
            <QuizResult
              score={score}
              total={quizData.length}
              onRestart={handleRestart}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
