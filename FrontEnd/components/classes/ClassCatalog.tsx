'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Sparkles,
  X,
} from 'lucide-react';
import { UNITS } from '@/data/lessons';

const units = Object.values(UNITS);

const subjects = [
  {
    id: 'computer-science',
    title: 'Computer Science',
    description: 'Explore programming, databases, networking, and web technology.',
    lessonCount: units.reduce((total, unit) => total + unit.lessons.length, 0),
    banner: '/assets/subjects/comuter.png',
  },
];

function CourseHero() {
  const subjectsRef = useRef<HTMLDivElement>(null);
  const [selectedSubject, setSelectedSubject] = useState<(typeof subjects)[number] | null>(null);

  const scrollSubjects = (direction: 'left' | 'right') => {
    subjectsRef.current?.scrollBy({
      left: direction === 'right' ? 320 : -320,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-primary-bg text-brand-primary"><BookOpen size={24} /></div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white"><Sparkles size={13} /> Class 12</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Science stream</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">Your Classes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">Explore your Class 12 subjects, follow guided lessons, and build your learning path one topic at a time.</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Your subjects</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Choose a subject and learn at your pace.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button type="button" onClick={() => scrollSubjects('left')} aria-label="Previous subjects" className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-brand-primary hover:text-brand-primary">
              <ChevronLeft size={17} />
            </button>
            <button type="button" onClick={() => scrollSubjects('right')} aria-label="Next subjects" className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-brand-primary hover:text-brand-primary">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
        <div ref={subjectsRef} className="scrollbar-hidden flex snap-x gap-4 overflow-x-auto pb-1">
          {subjects.map((subject) => (
            <button key={subject.id} type="button" onClick={() => setSelectedSubject(subject)} className="group min-w-[290px] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md sm:min-w-[360px]">
              <div className="relative aspect-[2.8/1] overflow-hidden bg-slate-900">
                <Image src={subject.banner} alt={`${subject.title} banner`} fill priority className="object-cover opacity-70 transition-transform duration-300 group-hover:scale-105" sizes="360px" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-between p-4"><h2 className="max-w-[75%] text-xl font-black text-white">{subject.title}</h2><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><ArrowRight size={17} /></span></div>
              </div>
              <div className="p-4"><p className="text-sm leading-6 text-slate-600">{subject.description}</p><p className="mt-3 text-xs font-bold text-brand-primary">{subject.lessonCount} lessons to explore</p></div>
            </button>
          ))}
          <div className="flex min-w-[290px] snap-start items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:min-w-[360px]"><div><p className="text-sm font-extrabold text-slate-700">More subjects coming soon</p><p className="mt-1 text-xs text-slate-500">Your future courses will appear here.</p></div></div>
        </div>
      </div>

      {selectedSubject && (
        <>
          <button type="button" aria-label="Close subject details" onClick={() => setSelectedSubject(null)} className="fixed inset-0 z-40 cursor-default bg-slate-950/30 backdrop-blur-[1px]" />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-primary">Subject details</p>
              <button type="button" onClick={() => setSelectedSubject(null)} aria-label="Close subject details" className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
            </div>
            <div className="relative aspect-[2/1] shrink-0 overflow-hidden bg-slate-900">
              <Image src={selectedSubject.banner} alt={`${selectedSubject.title} banner`} fill className="object-cover opacity-70" sizes="448px" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <h2 className="absolute bottom-5 left-5 text-3xl font-black text-white">{selectedSubject.title}</h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-hidden">
              <span className="inline-flex w-fit rounded-full bg-brand-primary-bg px-3 py-1 text-xs font-bold text-brand-primary">Class 12 · Science</span>
              <p className="mt-4 text-sm leading-6 text-slate-600">{selectedSubject.description}</p>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700"><BookOpen size={17} className="text-brand-primary" /> {selectedSubject.lessonCount} lessons available</div>
              <div className="mt-5 space-y-3">
                {units.map((unit, unitIndex) => (
                  <div key={unit.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ backgroundColor: unit.color }}><BookOpen size={14} /></span>
                      <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Unit {unitIndex + 1}</p><p className="truncate text-sm font-extrabold text-slate-800">{unit.courseTitle}</p></div>
                    </div>
                    <div className="space-y-1 border-t border-slate-100 pt-2">
                      {unit.lessons.map((lesson) => (
                        <Link key={lesson.id} href={`/learn/computer-science/${unit.id}`} onClick={() => setSelectedSubject(null)} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition-colors hover:bg-brand-primary-bg hover:text-brand-primary">
                          <span className="truncate">{lesson.title}</span>
                          {lesson.estimatedMinutes && <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-slate-400"><Clock3 size={11} />{lesson.estimatedMinutes}m</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 border-t border-slate-200 bg-white p-5">
              <Link href="/learn" onClick={() => setSelectedSubject(null)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-brand-primary-dark">Visit now <ArrowRight size={17} /></Link>
            </div>
          </aside>
        </>
      )}
    </section>
  );
}

export default function ClassCatalog() {
  return (
    <div className="space-y-6 md:space-y-8">
      <CourseHero />
    </div>
  );
}
