'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChartNoAxesCombined, ChevronDown, Clock3, ListChecks, Sparkles, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useProgress } from '@/hooks/useProgress';
import { resolveQuizContext } from '@/lib/quiz-context';
import { UNITS } from '@/data/lessons';

interface QuizPanelProps {
  onClose: () => void;
}

export default function QuizPanel({ onClose }: QuizPanelProps) {
  const router = useRouter();
  const { onboarding, data } = useUser();
  const { getUnitProgress } = useProgress();
  const subject = onboarding?.targetCourse.subject || data.targetCourse.subject || 'Computer Science';
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const subjectOptions = useMemo(() => Array.from(new Set([
    subject,
    ...Object.values(UNITS).map((unit) => unit.courseTitle),
  ])), [subject]);
  const selectedUnit = Object.values(UNITS).find((unit) => unit.courseTitle === selectedSubject);
  const completedLessons = selectedUnit ? getUnitProgress(selectedUnit.id).completedLessons : [];
  const adaptiveContext = resolveQuizContext(selectedSubject, completedLessons);
  const lessonOptions = selectedUnit?.lessons.filter((lesson) => lesson.hasQuiz) ?? [];
  const [selectedContent, setSelectedContent] = useState(adaptiveContext.content);

  const context = {
    ...adaptiveContext,
    content: selectedContent,
    contentLabel: selectedContent === 'mixed fundamentals' ? `${selectedSubject} fundamentals` : selectedContent,
    isLessonFocused: selectedContent !== 'mixed fundamentals',
  };

  const handleSubjectChange = (nextSubject: string) => {
    setSelectedSubject(nextSubject);
    const nextUnit = Object.values(UNITS).find((unit) => unit.courseTitle === nextSubject);
    const nextCompletedLessons = nextUnit ? getUnitProgress(nextUnit.id).completedLessons : [];
    setSelectedContent(resolveQuizContext(nextSubject, nextCompletedLessons).content);
  };

  const startQuiz = () => {
    const params = new URLSearchParams({ subject: context.subject, content: context.content });
    router.push(`/quiz?${params.toString()}`);
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-quiz-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-slate-200 bg-slate-50 shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >
        <header className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-primary">
              <ListChecks size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                <Sparkles size={12} aria-hidden="true" /> Daily challenge
              </p>
              <h1 id="daily-quiz-title" className="text-2xl font-extrabold tracking-tight text-slate-800">
                Quick Quiz
              </h1>
              <p className="mt-1 text-sm text-slate-500">A short challenge adapted to your learning path.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close daily quiz"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
          <div className="space-y-5">
            <div className="rounded-2xl border border-brand-primary-tint bg-brand-primary-bg p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Your adaptive quiz</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-800">{context.isLessonFocused ? 'Review what you just learned' : 'Keep your subjects warm'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{context.isLessonFocused ? 'We found a recent lesson and will build questions around it.' : 'No recent lesson found, so we will mix questions from your selected subject.'}</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <SelectField
                id="quiz-subject"
                label="Choose a subject"
                value={selectedSubject}
                onChange={handleSubjectChange}
                options={subjectOptions.map((option) => ({ value: option, label: option }))}
              />
              <SelectField
                id="quiz-lesson"
                label="Choose a lesson"
                value={selectedContent}
                onChange={setSelectedContent}
                options={[
                  { value: 'mixed fundamentals', label: `Mixed ${selectedSubject} fundamentals` },
                  ...lessonOptions.map((lesson) => ({ value: lesson.title, label: lesson.title })),
                ]}
              />
              <p className="text-xs leading-5 text-slate-400">Pick a lesson to focus the questions, or keep the mixed option for a broader review.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={BookOpen} label="Subject" value={context.subject} />
              <InfoRow icon={ListChecks} label="Focus" value={context.contentLabel} />
              <InfoRow icon={Clock3} label="Length" value="5 questions · ~2 min" />
              <InfoRow icon={Zap} label="Reward" value="Up to 50 XP" />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <div className="flex items-start gap-3"><ChartNoAxesCombined size={19} className="mt-0.5 shrink-0 text-amber-600" /><p>Every XP point you earn here — and in a duel — is added directly to your leaderboard score.</p></div>
            </div>

            <button type="button" onClick={startQuiz} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-5 font-bold text-white transition hover:bg-brand-primary-light active:translate-y-0.5 active:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-light focus-visible:ring-offset-2">
              Start quiz <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className="text-center text-xs text-slate-400">You can review your result and try again when you finish.</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-400"><Icon size={15} className="text-brand-primary" />{label}</div><p className="mt-2 text-sm font-bold text-slate-700">{value}</p></div>;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return <div>
    <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</label>
    <div className="relative">
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown size={17} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  </div>;
}
