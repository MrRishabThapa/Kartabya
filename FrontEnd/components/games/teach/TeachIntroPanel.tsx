'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleHelp, LoaderCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCompletedTeachLessons } from '@/lib/games/teach/api';
import type { CompletedTeachLesson } from '@/lib/games/teach/types';

export default function TeachIntroPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [lessons, setLessons] = useState<CompletedTeachLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    void getCompletedTeachLessons().then((items) => {
      if (!active) return;
      setLessons(items);
      setSelectedLessonId(items[0]?.id ?? '');
    }).catch(() => {
      if (active) setError('Completed lessons could not be loaded.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
  const openLessons = () => { onClose(); router.push('/learn'); };
  const startTeaching = () => {
    if (!selectedLesson) return;
    onClose();
    const params = new URLSearchParams({
      lesson_id: selectedLesson.id,
      topic_title: selectedLesson.title,
      subject: selectedLesson.subject,
    });
    router.push(`/games/teach/play?${params.toString()}`);
  };

  return <AnimatePresence>
    <motion.div key="teach-root" className="pointer-events-none fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="pointer-events-auto absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <motion.aside role="dialog" aria-modal="true" aria-label="Teach Your Companion" className="pointer-events-auto fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-slate-200 bg-slate-50 shadow-2xl" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 32 }}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
        <div className="space-y-5">
          <div className="rounded-2xl border border-brand-primary-tint bg-gradient-to-br from-brand-primary-bg via-white to-orange-50 p-6"><div className="flex items-center gap-4"><div className="relative h-16 w-16"><Image src="/assets/logo.png" alt="Fox companion logo" fill className="object-contain" /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Voice learning game</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800">Teach Your Companion</h2></div></div><p className="mt-5 text-sm leading-6 text-slate-600">Choose a lesson you have completed. Explain it out loud, answer a few questions, and get a grade with XP.</p></div>
          <div className="grid grid-cols-3 gap-2"><Meta text="Solo" /><Meta text="~2 min" /><Meta text="+30 XP" /></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><div className="flex gap-2 font-extrabold"><CircleHelp size={18} /> How it works</div><p className="mt-2 text-xs">The AI stays quiet while you explain, then asks up to three questions before grading your understanding.</p></div>
          {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500"><LoaderCircle size={18} className="animate-spin text-brand-primary" /> Loading completed lessons…</div> : error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : lessons.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center"><p className="text-sm font-extrabold text-slate-800">No completed lessons yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Finish and mark a lesson complete first, then it will appear here.</p><button type="button" onClick={openLessons} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-4 text-sm font-bold text-white hover:bg-brand-primary-light">Open lessons <ArrowRight size={17} /></button></div> : <div className="space-y-3"><label htmlFor="completed-teach-lesson" className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Choose a completed topic</label><select id="completed-teach-lesson" value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20">{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.topic} · {lesson.title}</option>)}</select><button type="button" onClick={startTeaching} disabled={!selectedLesson} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-4 font-bold text-white hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50"><Sparkles size={17} /> Teach this topic <ArrowRight size={17} /></button></div>}
        </div>
      </div>
      </motion.aside>
    </motion.div>
  </AnimatePresence>;
}

function Meta({ text }: { text: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-600">{text}</div>; }
