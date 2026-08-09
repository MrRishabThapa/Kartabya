'use client';

import { useState } from 'react';
import DartAnimation from '../parts/DartAnimation';
import Dartboard from '../parts/Dartboard';
import FoxMascot from '../parts/FoxMascot';
import AccuracyDisplay from '../parts/AccuracyDisplay';
import FeedbackCard from '../parts/FeedbackCard';
import type { TeachResult, TeachTopic } from '@/lib/games/teach/types';

export default function ResultScreen({ result, topic, onAnother, onRetry, onClose }: { result: TeachResult; topic: TeachTopic; onAnother: () => void; onRetry: () => void; onClose: () => void }) {
  const [showIdeal, setShowIdeal] = useState(false);
  return <div className="space-y-5"><div className="rounded-2xl border border-brand-primary-tint bg-gradient-to-br from-orange-50 via-white to-brand-primary-bg p-5"><p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">{topic.title}</p><div className="relative mt-3 flex min-h-44 items-center justify-between"><FoxMascot cheering={result.band === 'bullseye'} /><Dartboard wobble={result.accuracy_percent >= 70} /><DartAnimation accuracy={result.accuracy_percent} /></div><div className="mt-3"><AccuracyDisplay accuracy={result.accuracy_percent} band={result.band} xp={result.xp_earned} /></div></div><FeedbackCard feedback={result.feedback} ideal={result.correct_answer} showIdeal={showIdeal} onToggle={() => setShowIdeal((value) => !value)} /><div className="grid gap-3 sm:grid-cols-3"><button type="button" onClick={onAnother} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Try another topic</button><button type="button" onClick={onRetry} className="rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-3 py-3 text-sm font-bold text-white hover:bg-brand-primary-light">Retry this topic</button><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50">Close</button></div></div>;
}
