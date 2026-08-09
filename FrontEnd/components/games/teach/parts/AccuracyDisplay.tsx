'use client';

import { useEffect, useState } from 'react';
import type { TeachBand } from '@/lib/games/teach/types';

export default function AccuracyDisplay({ accuracy, band, xp }: { accuracy: number; band: TeachBand; xp: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / 1000);
      setValue(Math.round(accuracy * progress));
      if (progress === 1) window.clearInterval(timer);
    }, 30);
    return () => window.clearInterval(timer);
  }, [accuracy]);
  const label = band === 'bullseye' ? '🎯 BULLSEYE!' : band === 'great' ? 'Great!' : band === 'good' ? 'Good try' : 'Keep practicing';
  return <div className="text-center" aria-live="polite"><p className="text-6xl font-black tracking-tight text-brand-primary">{value}%</p><p className="mt-2 text-xl font-extrabold text-slate-800">{label}</p><span className="mt-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-800">+{xp} XP</span></div>;
}
