'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Check,
  Plus,
  Send,
  StickyNote,
  Trash2,
} from 'lucide-react';
import EBookContainer from '@/components/ebook/EBookContainer';
import { useUser } from '@/context/UserContext';
import type { Lesson, Unit } from '@/types/lessons-types';

interface StickyNoteItem {
  id: string;
  text: string;
  color: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  text: string;
}

const NOTE_COLORS = ['#FFF4B8', '#DDF7E7', '#DDEBFF', '#FFE1E1'];

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

  const saveNotes = (nextNotes: StickyNoteItem[]) => {
    setNotes(nextNotes);
    window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
  };

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    saveNotes([
      ...notes,
      { id: `${lesson.id}-${Date.now()}`, text, color: NOTE_COLORS[notes.length % NOTE_COLORS.length] },
    ]);
    setDraft('');
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2"><StickyNote size={17} className="text-brand-primary" /><h2 className="text-sm font-extrabold text-slate-800">My notes</h2></div>
        <span className="text-[11px] font-semibold text-slate-400">Saved automatically</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hidden">
        {notes.length === 0 ? (
          <div className="grid h-full min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center"><div><StickyNote size={24} className="mx-auto text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-500">Capture an idea from the ebook</p><p className="mt-1 text-[11px] text-slate-400">Your notes will be available from your dashboard later.</p></div></div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {notes.map((note) => <article key={note.id} className="relative min-h-24 rounded-xl p-3 shadow-sm" style={{ backgroundColor: note.color }}><p className="pr-5 text-xs font-semibold leading-5 text-slate-700">{note.text}</p><button type="button" onClick={() => saveNotes(notes.filter((item) => item.id !== note.id))} aria-label="Delete note" className="absolute right-2 top-2 cursor-pointer text-slate-500/70 transition-colors hover:text-red-600"><Trash2 size={13} /></button></article>)}
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-2 border-t border-slate-100 p-3">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addNote(); }} placeholder="Write a sticky note..." aria-label="New sticky note" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary" />
        <button type="button" onClick={addNote} aria-label="Add note" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-primary text-white transition-colors hover:bg-brand-primary-dark"><Plus size={17} /></button>
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
