"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuizQuestion from "./QuizQuestion";
import QuizProgress from "./QuizProgress";
import QuizResult from "./QuizResult";

import ErrorState from "@/components/shared/ErrorState";
import { BackendQuestion, QuizAttemptResult } from "@/types/backendQuiz";
import QuizSkeletonContent from "./QuizSkeletonContent";
import { awardXp } from "@/lib/xp";
import { api, ApiError } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";

interface QuizContainerProps {
  subject?: string;
  content?: string;
}

interface AnswerHistoryItem {
  number: number;
  question: string;
  selectedText: string | null;
  answerText: string;
  correct: boolean;
}

export default function QuizContainer({ subject = 'Computer Science', content = 'mixed fundamentals' }: QuizContainerProps) {
  const { onboarding } = useUser();
  const interests = onboarding?.hobbies.join(", ") || undefined;
  const [quizData, setQuizData] = useState<BackendQuestion[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ number: number; selected: string | null }>>([]);
  const [history, setHistory] = useState<AnswerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await api.post("/v1/quiz", {
            type: "Quiz",
            number_of_qns: 5,
            user_interest: interests,
            subject,
            content,
        });
        setQuizId(data.id);
        setQuizData(data.questions);
      } catch (err: unknown) {
        const apiError = err instanceof ApiError ? err.body?.detail : undefined;
        setError(apiError || (err instanceof Error ? err.message : "Quiz generation failed."));
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [subject, content, interests]);

  const handleNext = async (correct: boolean, selected: string | null) => {
    const currentQuestion = quizData[index];
    const selectedOption = currentQuestion.options.find((option) => option.option === selected);
    const answerOption = currentQuestion.options.find((option) => option.option === currentQuestion.answer);
    const nextAnswers = [...answers, { number: currentQuestion.number, selected }];
    setHistory((previous) => [{
      number: currentQuestion.number,
      question: currentQuestion.question,
      selectedText: selectedOption?.text ?? null,
      answerText: answerOption?.text ?? currentQuestion.answer,
      correct,
    }, ...previous]);
    setAnswers(nextAnswers);
    const nextScore = score + (correct ? 1 : 0);
    if (correct) setScore(nextScore);

    if (index < quizData.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      if (!quizId) {
        setError("This quiz could not be submitted because its ID is missing.");
        return;
      }

      try {
        const result = (await api.post(`/v1/quiz/${quizId}/attempt`, {
          answers: nextAnswers,
        })) as QuizAttemptResult;
        setScore(result.score);
        awardXp(result.score * 10);
      } catch (err: unknown) {
        const apiError = err instanceof ApiError ? err.body?.detail : undefined;
        setError(apiError || (err instanceof Error ? err.message : "Quiz submission failed."));
        return;
      }
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setScore(0);
    setAnswers([]);
    setHistory([]);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <QuizHistory items={history} />
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
    <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <QuizHistory items={history} />
      <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
        <div className="space-y-8">
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
      </div>
    </div>
  );
}

function QuizHistory({ items }: { items: AnswerHistoryItem[] }) {
  return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6" aria-labelledby="quiz-history-title">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Your trail</p><h2 id="quiz-history-title" className="mt-1 text-lg font-black tracking-tight text-slate-800">Answer history</h2></div>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{items.length}</span>
    </div>
    {items.length === 0 ? <div className="py-8 text-center"><CircleAlert size={22} className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-500">Your answered questions will appear here.</p><p className="mt-1 text-xs leading-5 text-slate-400">Green means correct. Red means review this one.</p></div> : <div className="scrollbar-hidden mt-4 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
      {items.map((item) => <div key={item.number} className={`rounded-xl border p-3 ${item.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-start gap-2">
          {item.correct ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" aria-hidden="true" />}
          <div className="min-w-0"><p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${item.correct ? 'text-emerald-700' : 'text-red-700'}`}>Question {item.number} · {item.correct ? 'Correct' : 'Review'}</p><p className="mt-1 text-sm font-bold leading-5 text-slate-700">{item.question}</p><p className={`mt-2 text-xs font-semibold leading-5 ${item.correct ? 'text-emerald-700' : 'text-red-700'}`}>Your answer: &quot;{item.selectedText ?? 'Skipped'}&quot;{!item.correct && ` · Correct: "${item.answerText}"`}</p></div>
        </div>
      </div>)}
    </div>}
  </aside>;
}
