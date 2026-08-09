'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function DartAnimation({ accuracy }: { accuracy: number }) {
  const reduced = useReducedMotion();
  const target = accuracy >= 90 ? { x: '78%', y: '50%' } : accuracy >= 70 ? { x: '75%', y: accuracy % 2 ? '39%' : '61%' } : accuracy >= 50 ? { x: '72%', y: accuracy % 2 ? '28%' : '72%' } : { x: '68%', y: '86%' };
  return <motion.div className="pointer-events-none absolute left-[17%] top-1/2 z-10" initial={reduced ? { left: target.x, top: target.y, rotate: 0 } : { left: '22%', top: '56%', rotate: -20, scale: 0.7 }} animate={{ left: target.x, top: target.y, rotate: 18, scale: 1 }} transition={reduced ? { duration: 0 } : { duration: 1.1, ease: 'easeOut' }}><svg width="48" height="22" viewBox="0 0 48 22" aria-label="Dart landing" role="img"><path d="M2 11h34" stroke="#8b4a2b" strokeWidth="4" strokeLinecap="round" /><path d="M35 11 46 5 43 11l3 6Z" fill="#e85d2a" /><path d="m9 11-6-7M9 11l-6 7" stroke="#f3a35b" strokeWidth="3" strokeLinecap="round" /></svg></motion.div>;
}
