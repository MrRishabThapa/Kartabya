import type { TeachFeedback } from '@/lib/games/teach/types';

export default function FeedbackCard({ feedback, ideal, showIdeal, onToggle }: { feedback: TeachFeedback; ideal: string; showIdeal: boolean; onToggle: () => void }) {
  return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><FeedbackSection title="What you got right" icon="✅" items={feedback.correct_points} tone="emerald" /><FeedbackSection title="What was missing" icon="⚠️" items={feedback.missing_points} tone="amber" /><FeedbackSection title="What was off" icon="❌" items={feedback.incorrect_points} tone="rose" /></div><div className="rounded-xl border border-brand-primary-tint bg-brand-primary-bg p-4 text-sm font-semibold leading-6 text-brand-primary-dark">💡 {feedback.praise_or_tip}</div><button type="button" onClick={onToggle} className="text-sm font-bold text-brand-primary hover:text-brand-primary-dark">{showIdeal ? 'Hide ideal explanation' : 'Show ideal explanation'}</button>{showIdeal && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">{ideal}</div>}</div>;
}

function FeedbackSection({ title, icon, items, tone }: { title: string; icon: string; items: string[]; tone: 'emerald' | 'amber' | 'rose' }) {
  if (!items.length && tone === 'rose') return null;
  return <div className={`rounded-xl border p-4 ${tone === 'emerald' ? 'border-emerald-100 bg-emerald-50' : tone === 'amber' ? 'border-amber-100 bg-amber-50' : 'border-rose-100 bg-rose-50'}`}><p className="text-sm font-extrabold text-slate-800">{icon} {title}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-600">{(items.length ? items : ['Keep building on this explanation.']).map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
