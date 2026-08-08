'use client';

import { FormEvent, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Check,
  Plus,
  Send,
  StickyNote,
  Trash2,
  Minus,
  RotateCcw,
  ZoomIn,
} from 'lucide-react';
import EBookContainer from '@/components/ebook/EBookContainer';
import { useUser } from '@/context/UserContext';
import type { Lesson, Unit } from '@/types/lessons-types';

interface StickyNoteItem {
  id: string;
  text: string;
  color: string;
  x?: number;
  y?: number;
  rotation?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  text: string;
}

const NOTE_COLORS = ['#FFF4B8', '#DDF7E7', '#DDEBFF', '#FFE1E1'];
const MAX_NOTES_PER_SESSION = 30;
const PAPER_SLAP_SOUND = 'https://orangefreesounds.com/wp-content/uploads/2015/10/Slap-sound-effect.mp3';

function playPaperFallback() {
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(145, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(62, context.currentTime + 0.09);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.11);
  window.setTimeout(() => void context.close(), 180);
}

function getStoredNotes(key: string): StickyNoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as StickyNoteItem[] : [];
  } catch {
    return [];
  }
}

function answerDoubt(question: string, lesson: Lesson): string {
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.includes('what') && lowerQuestion.includes('database')) {
    return 'A database is an organised collection of data that makes storing, finding, and updating information easier.';
  }
  if (lowerQuestion.includes('sql')) {
    return 'SQL is the language used to work with relational databases. It can retrieve, add, update, and remove records.';
  }
  return `Let’s connect that to “${lesson.title}”. Try explaining the idea in your own words first, then look for the definition or example on the ebook page.`;
}

function NotesBoard({ lesson }: { lesson: Lesson }) {
  const storageKey = `adaptiv-lesson-notes:${lesson.id}`;
  const [notes, setNotes] = useState<StickyNoteItem[]>(() => getStoredNotes(storageKey));
  const [draft, setDraft] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragOrigin = useRef({ x: 0, y: 0 });

  const saveNotes = (nextNotes: StickyNoteItem[]) => {
    setNotes(nextNotes);
    window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
  };

  const addNote = () => {
    const text = draft.trim();
    if (!text || notes.length >= MAX_NOTES_PER_SESSION) return;
    const noteIndex = notes.length;
    const column = noteIndex % 5;
    const row = Math.floor(noteIndex / 5);
    saveNotes([
      ...notes,
      {
        id: `${lesson.id}-${Date.now()}`,
        text,
        color: NOTE_COLORS[noteIndex % NOTE_COLORS.length],
        x: 30 + column * 180,
        y: 34 + row * 112,
        rotation: [-2, 1.5, -1, 2.5][noteIndex % 4],
      },
    ]);
    setDraft('');

    // Freesound paper-smack style effect; browsers may block remote audio, so failure is silent.
    const slap = new Audio(PAPER_SLAP_SOUND);
    slap.volume = 0.34;
    void slap.play().catch(() => playPaperFallback());
  };

  const changeZoom = (amount: number) => setZoom((value) => Math.min(1.55, Math.max(0.65, value + amount)));
  const resetCanvas = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2"><StickyNote size={17} className="text-brand-primary" /><h2 className="text-sm font-extrabold text-slate-800">My notes</h2></div>
        <span className="text-[11px] font-semibold text-slate-400">Saved automatically</span>
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-hidden bg-[#e8edf2] p-3"
        onWheel={(event) => { event.preventDefault(); changeZoom(event.deltaY > 0 ? -0.08 : 0.08); }}
      >
        <div className="pointer-events-none absolute left-5 top-4 z-20 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-sm">
          Drag canvas · scroll to zoom
        </div>
        <div className="absolute right-4 top-3 z-20 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
          <button type="button" onClick={() => changeZoom(-0.1)} aria-label="Zoom out" className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Minus size={14} /></button>
          <span className="w-10 text-center text-[10px] font-bold text-slate-500">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(0.1)} aria-label="Zoom in" className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><ZoomIn size={14} /></button>
          <button type="button" onClick={resetCanvas} aria-label="Reset canvas view" className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><RotateCcw size={13} /></button>
        </div>
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => { dragOrigin.current = pan; }}
          onDrag={(_, info) => setPan({ x: dragOrigin.current.x + info.offset.x, y: dragOrigin.current.y + info.offset.y })}
          className="absolute left-1/2 top-1/2 h-[720px] w-[960px] cursor-grab touch-none active:cursor-grabbing"
          style={{ x: pan.x, y: pan.y, scale: zoom, marginLeft: -480, marginTop: -360 }}
        >
          <div className="absolute inset-0 rounded-xl border border-slate-300/70 bg-[#dfe5e9] shadow-inner" />
          <AnimatePresence initial={false}>
            {notes.map((note, index) => (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, scale: 1.25, y: -34, rotate: (note.rotation ?? 0) - 7 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: note.rotation ?? 0 }}
                exit={{ opacity: 0, scale: 0.82, y: -12, rotate: -7 }}
                transition={{ type: 'spring', stiffness: 440, damping: 22, mass: 0.7 }}
                className="absolute h-[116px] w-[158px] overflow-hidden p-3.5 text-slate-700 [clip-path:polygon(0_0,100%_0,100%_86%,86%_100%,0_100%)] [filter:drop-shadow(0_7px_5px_rgba(15,23,42,0.18))]"
                style={{ left: note.x ?? 30 + (index % 5) * 180, top: note.y ?? 34 + (Math.floor(index / 5) % 6) * 112, backgroundColor: note.color, backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,.42), transparent 42%), repeating-linear-gradient(0deg, rgba(120,90,40,.045) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,.14) 0 1px, transparent 1px 5px)' }}
              >
                <p className="pr-5 text-xs font-bold leading-5">{note.text}</p>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => saveNotes(notes.filter((item) => item.id !== note.id))} aria-label="Delete note" className="absolute right-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md text-slate-500/70 transition-colors hover:bg-white/35 hover:text-red-600"><Trash2 size={13} /></button>
              </motion.article>
            ))}
          </AnimatePresence>
          {notes.length === 0 && <div className="absolute inset-0 grid place-items-center text-center"><div className="rounded-2xl bg-white/65 px-6 py-5 shadow-sm backdrop-blur-sm"><StickyNote size={24} className="mx-auto text-brand-primary/60" /><p className="mt-2 text-xs font-extrabold text-slate-600">Your canvas is ready</p><p className="mt-1 text-[11px] text-slate-400">Add a note and slap it onto the board.</p></div></div>}
        </motion.div>
      </div>
      <div className="shrink-0 border-t border-slate-100 p-3">
        {notes.length >= MAX_NOTES_PER_SESSION && <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">You’ve reached the {MAX_NOTES_PER_SESSION}-note limit for this lesson session.</p>}
        <div className="flex gap-2">
          <input disabled={notes.length >= MAX_NOTES_PER_SESSION} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addNote(); }} placeholder={notes.length >= MAX_NOTES_PER_SESSION ? 'Session note limit reached' : 'Write a sticky note...'} aria-label="New sticky note" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60" />
          <button disabled={notes.length >= MAX_NOTES_PER_SESSION} type="button" onClick={addNote} aria-label="Add note" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-primary text-white transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} /></button>
        </div>
      </div>
    </section>
  );
}

function CompanionChat({ lesson }: { lesson: Lesson }) {
  const { onboarding } = useUser();
  const companionName = onboarding?.foxNickname?.trim() || 'Nova';
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'companion', text: `Hi! I’m ${companionName}. Ask me anything about this lesson and we’ll work through it together.` },
  ]);
  const [draft, setDraft] = useState('');

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-question`, role: 'user', text },
      { id: `${Date.now()}-answer`, role: 'companion', text: answerDoubt(text, lesson) },
    ]);
    setDraft('');
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 px-4 py-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-primary-bg text-brand-primary"><Bot size={16} /></span><div><h2 className="text-sm font-extrabold text-slate-800">Ask {companionName}</h2><p className="text-[10px] font-semibold text-emerald-600">Ready to help with this lesson</p></div></div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 scrollbar-hidden">
        {messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-5 ${message.role === 'user' ? 'rounded-br-md bg-brand-primary text-white' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>{message.text}</div></div>)}
      </div>
      <form onSubmit={sendMessage} className="flex shrink-0 gap-2 border-t border-slate-100 p-3"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Ask ${companionName} a doubt...`} aria-label={`Ask ${companionName} a question`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-brand-primary" /><button type="submit" aria-label="Send question" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-brand-primary"><Send size={15} /></button></form>
    </section>
  );
}

export default function LessonWorkspace({ unit, lesson }: { unit: Unit; lesson: Lesson }) {
  const [completed, setCompleted] = useState(false);
  const unitIndex = unit.lessons.findIndex((item) => item.id === lesson.id);

  return (
    <main className="flex h-[100dvh] min-h-[640px] flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href={`/learn/computer-science/${unit.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back to {unit.courseTitle}</span></Link>
        <div className="min-w-0 text-center"><p className="truncate text-sm font-extrabold text-slate-800">{lesson.title}</p><p className="text-[11px] font-semibold text-slate-400">Lesson {unitIndex + 1} · {unit.title}</p></div>
        <button type="button" onClick={() => setCompleted((value) => !value)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-colors ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-primary text-white hover:bg-brand-primary-dark'}`}>{completed ? <Check size={15} /> : null}{completed ? 'Completed' : 'Mark complete'}</button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:p-5">
        <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><EBookContainer topic={lesson.title} embedded /></section>
        <div className="grid min-h-0 grid-rows-2 gap-4"><NotesBoard lesson={lesson} /><CompanionChat lesson={lesson} /></div>
      </div>
    </main>
  );
}
