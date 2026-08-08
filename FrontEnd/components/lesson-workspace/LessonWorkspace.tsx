'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bot,
  Check,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
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
import { api } from '@/lib/api';
import { getLessonStickyNotes, resolveContentContext, type ContentContext } from '@/lib/content-api';

interface StickyNoteItem {
  id: string;
  text: string;
  color: string;
  x?: number;
  y?: number;
  rotation?: number;
  remoteId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  text: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const NOTE_COLORS = ['#FFF4B8', '#DDF7E7', '#DDEBFF', '#FFE1E1'];
const MAX_NOTES_PER_SESSION = 30;
const MAX_NOTE_CHARACTERS = 200;
const NOTE_GRID_COLUMNS = 5;
const NOTE_GRID_X = 230;
const NOTE_GRID_Y = 180;
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
    return saved ? (JSON.parse(saved) as StickyNoteItem[]).map((note) => ({ ...note, text: note.text.slice(0, MAX_NOTE_CHARACTERS) })) : [];
  } catch {
    return [];
  }
}

function getGridPosition(index: number) {
  return {
    x: 30 + (index % NOTE_GRID_COLUMNS) * NOTE_GRID_X,
    y: 34 + Math.floor(index / NOTE_GRID_COLUMNS) * NOTE_GRID_Y,
  };
}

function getNoteDimensions(text: string) {
  const growth = Math.min(4, Math.ceil(text.length / 50));
  return {
    width: 158 + growth * 15,
    height: 116 + growth * 15,
  };
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

function NotesBoard({ lesson, contentContext }: { lesson: Lesson; contentContext: ContentContext | null }) {
  const storageKey = `adaptiv-lesson-notes:${lesson.id}`;
  const [notes, setNotes] = useState<StickyNoteItem[]>(() => getStoredNotes(storageKey));
  const [draft, setDraft] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isOrganized, setIsOrganized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const notesBoardRef = useRef<HTMLElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === notesBoardRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!contentContext) return;
    let active = true;
    void getLessonStickyNotes(contentContext.lesson.id).then((remoteNotes) => {
      if (!active) return;
      const nextNotes = remoteNotes.slice(0, MAX_NOTES_PER_SESSION).map((remoteNote, index) => ({
        id: remoteNote.id,
        remoteId: remoteNote.id,
        text: remoteNote.note.slice(0, MAX_NOTE_CHARACTERS),
        color: NOTE_COLORS[index % NOTE_COLORS.length],
        ...getGridPosition(index),
        rotation: 0,
      }));
      setNotes(nextNotes);
      window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [contentContext, storageKey]);

  const saveNotes = (nextNotes: StickyNoteItem[]) => {
    setNotes(nextNotes);
    window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
  };

  const addNote = async () => {
    const text = draft.trim().slice(0, MAX_NOTE_CHARACTERS);
    if (!text || notes.length >= MAX_NOTES_PER_SESSION) return;
    const noteIndex = notes.length;
    const position = getGridPosition(noteIndex);
    const optimisticNote: StickyNoteItem = {
      id: `${lesson.id}-${Date.now()}`,
      text,
      color: NOTE_COLORS[noteIndex % NOTE_COLORS.length],
      ...position,
      rotation: 0,
    };
    saveNotes([
      ...notes,
      optimisticNote,
    ]);
    setIsOrganized(false);
    setDraft('');

    // Freesound paper-smack style effect; browsers may block remote audio, so failure is silent.
    const slap = new Audio(PAPER_SLAP_SOUND);
    slap.volume = 0.34;
    void slap.play().catch(() => playPaperFallback());

    if (contentContext?.classId) {
      try {
        const remoteNote = await api.post('/api/v1/content/sticky-notes', {
          class_id: contentContext.classId,
          lesson_id: contentContext.lesson.id,
          note: text,
        }) as { id: string };
        setNotes((current) => {
          const nextNotes = current.map((note) => note.id === optimisticNote.id ? { ...note, id: remoteNote.id, remoteId: remoteNote.id } : note);
          window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));
          return nextNotes;
        });
      } catch {
        toast.error('Note saved locally, but could not sync to your account.');
      }
    }
  };

  const changeZoom = (amount: number) => setZoom((value) => Math.min(1.55, Math.max(0.65, value + amount)));
  const resetCanvas = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await notesBoardRef.current?.requestFullscreen();
  };

  const organizeNotes = () => {
    saveNotes(notes.map((note, index) => ({
      ...note,
      ...getGridPosition(index),
      rotation: 0,
    })));
    setSelectedNoteId(null);
    setIsOrganized(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const deleteAllNotes = () => {
    if (!notes.length) return;
    toast('Delete all sticky notes?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete all',
        onClick: () => {
          void Promise.all(notes.filter((note) => note.remoteId).map((note) => api.delete(`/api/v1/content/sticky-notes/${note.remoteId}`))).catch(() => toast.error('Some notes could not be removed from your account.'));
          saveNotes([]);
          setSelectedNoteId(null);
          setIsOrganized(false);
          toast.success('All sticky notes deleted.');
        },
      },
      cancel: { label: 'Cancel', onClick: () => undefined },
    });
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      setDraft((current) => `${current}${current ? ' ' : ''}${transcript}`.trim().slice(0, MAX_NOTE_CHARACTERS));
      setVoiceStatus('Voice note captured. You can edit it before adding.');
    };
    recognition.onerror = () => {
      setIsListening(false);
      setVoiceStatus('Could not hear that. Try speaking again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceStatus('Listening… speak your note.');
    setIsListening(true);
    recognition.start();
  };

  return (
    <section ref={notesBoardRef} className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 bg-white shadow-sm ${isFullscreen ? 'h-[100dvh] w-screen rounded-none' : 'rounded-2xl'}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2"><StickyNote size={17} className="text-brand-primary" /><h2 className="text-sm font-extrabold text-slate-800">My notes</h2></div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={organizeNotes} disabled={notes.length < 2} className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isOrganized ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-brand-primary-tint bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint'}`} aria-label={isOrganized ? 'Notes are organized' : 'Organize notes into a grid'} aria-pressed={isOrganized}>
            {isOrganized ? <Check size={14} /> : <LayoutGrid size={14} />} {isOrganized ? 'Organized' : 'Organize'}
          </button>
          <button type="button" onClick={deleteAllNotes} disabled={!notes.length} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 text-[11px] font-extrabold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Delete all sticky notes">
            <Trash2 size={14} /> <span className="hidden sm:inline">Delete all</span>
          </button>
          <button type="button" onClick={() => void toggleFullscreen()} aria-label={isFullscreen ? 'Exit fullscreen notes' : 'Open notes in fullscreen'} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <span className="hidden text-[11px] font-semibold text-slate-400 sm:inline">Saved automatically</span>
        </div>
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
          className="absolute left-1/2 top-1/2 h-[1120px] w-[1200px] cursor-grab touch-none active:cursor-grabbing"
          style={{ x: pan.x, y: pan.y, scale: zoom, marginLeft: -600, marginTop: -560 }}
        >
          <div className="absolute inset-0 rounded-xl border border-slate-300/70 bg-[#dfe5e9] shadow-inner" />
          <AnimatePresence initial={false}>
            {notes.map((note, index) => (
              <motion.article
                key={note.id}
                layout
                drag
                dragMomentum={false}
                dragElastic={0.05}
                dragConstraints={{ left: 0, right: 980, top: 0, bottom: 960 }}
                onPointerDown={(event) => { event.stopPropagation(); setSelectedNoteId(note.id); }}
                onDragStart={() => setSelectedNoteId(note.id)}
                onDragEnd={(_, info) => {
                  const fallbackPosition = getGridPosition(index);
                  const currentX = note.x ?? fallbackPosition.x;
                  const currentY = note.y ?? fallbackPosition.y;
                  saveNotes(notes.map((item) => item.id === note.id ? { ...item, x: Math.max(0, Math.min(980, currentX + info.offset.x / zoom)), y: Math.max(0, Math.min(960, currentY + info.offset.y / zoom)) } : item));
                  setIsOrganized(false);
                }}
                initial={{ opacity: 0, scale: 1.25, y: -34, rotate: (note.rotation ?? 0) - 7 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: note.rotation ?? 0 }}
                exit={{ opacity: 0, scale: 0.82, y: -12, rotate: -7 }}
                transition={{ type: 'spring', stiffness: 440, damping: 22, mass: 0.7 }}
                className={`absolute min-h-[116px] min-w-[158px] cursor-grab overflow-hidden p-3.5 text-slate-700 [clip-path:polygon(0_0,100%_0,100%_86%,86%_100%,0_100%)] [filter:drop-shadow(0_7px_5px_rgba(15,23,42,0.18))] active:cursor-grabbing ${selectedNoteId === note.id ? 'z-10 ring-2 ring-brand-primary ring-offset-2' : ''}`}
                style={{ ...getNoteDimensions(note.text), left: note.x ?? getGridPosition(index).x, top: note.y ?? getGridPosition(index).y, backgroundColor: note.color, backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,.42), transparent 42%), repeating-linear-gradient(0deg, rgba(120,90,40,.045) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,.14) 0 1px, transparent 1px 5px)' }}
              >
                <p className="pointer-events-none break-words pr-5 text-xs font-bold leading-5">{note.text}</p>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => {
                  if (note.remoteId) void api.delete(`/api/v1/content/sticky-notes/${note.remoteId}`).catch(() => toast.error('Could not remove this note from your account.'));
                  saveNotes(notes.filter((item) => item.id !== note.id));
                }} aria-label="Delete note" className="absolute right-2 top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-md text-slate-500/70 transition-colors hover:bg-white/35 hover:text-red-600"><Trash2 size={13} /></button>
              </motion.article>
            ))}
          </AnimatePresence>
          {notes.length === 0 && <div className="absolute inset-0 grid place-items-center text-center"><div className="rounded-2xl bg-white/65 px-6 py-5 shadow-sm backdrop-blur-sm"><StickyNote size={24} className="mx-auto text-brand-primary/60" /><p className="mt-2 text-xs font-extrabold text-slate-600">Your canvas is ready</p><p className="mt-1 text-[11px] text-slate-400">Add a note and slap it onto the board.</p></div></div>}
        </motion.div>
      </div>
      <div className="shrink-0 border-t border-slate-100 p-3">
        {notes.length >= MAX_NOTES_PER_SESSION && <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">You’ve reached the {MAX_NOTES_PER_SESSION}-note limit for this lesson session.</p>}
        {voiceStatus && <p className={`mb-2 text-[10px] font-semibold ${isListening ? 'text-brand-primary' : 'text-slate-400'}`} role="status">{voiceStatus}</p>}
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
          <input disabled={notes.length >= MAX_NOTES_PER_SESSION} maxLength={MAX_NOTE_CHARACTERS} value={draft} onChange={(event) => setDraft(event.target.value.slice(0, MAX_NOTE_CHARACTERS))} onKeyDown={(event) => { if (event.key === 'Enter') void addNote(); }} placeholder={notes.length >= MAX_NOTES_PER_SESSION ? 'Session note limit reached' : 'Write a sticky note...'} aria-label="New sticky note" className="h-full w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-14 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">{draft.length}/{MAX_NOTE_CHARACTERS}</span>
          </div>
          <button disabled={notes.length >= MAX_NOTES_PER_SESSION} type="button" onClick={toggleVoiceInput} aria-label={isListening ? 'Stop voice input' : 'Speak a sticky note'} aria-pressed={isListening} className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-primary-bg text-brand-primary hover:bg-brand-primary-tint'}`}>{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button>
          <button disabled={notes.length >= MAX_NOTES_PER_SESSION} type="button" onClick={() => void addNote()} aria-label="Add note" className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-primary text-white transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} /></button>
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
  const [contentContext, setContentContext] = useState<ContentContext | null>(null);
  const unitIndex = unit.lessons.findIndex((item) => item.id === lesson.id);

  useEffect(() => {
    let active = true;
    void resolveContentContext(lesson.id, lesson.title, unit.courseTitle).then((context) => {
      if (active) setContentContext(context);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [lesson.id, lesson.title, unit.courseTitle]);

  useEffect(() => {
    if (!contentContext) return;
    void api.get(`/api/v1/content/lessons/${contentContext.lesson.id}/progress`).then((progress) => {
      setCompleted(Boolean((progress as { completed?: boolean }).completed));
    }).catch(() => undefined);
  }, [contentContext]);

  const toggleCompleted = async () => {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);
    if (!contentContext) return;
    try {
      await api.put(`/api/v1/content/lessons/${contentContext.lesson.id}/progress`, { completed: nextCompleted });
      toast.success(nextCompleted ? 'Lesson marked complete.' : 'Lesson marked incomplete.');
    } catch {
      setCompleted(!nextCompleted);
      toast.error('Progress could not be saved.');
    }
  };

  return (
    <main className="flex h-[100dvh] min-h-[640px] flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <Link href={`/learn/computer-science/${unit.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back to {unit.courseTitle}</span></Link>
        <div className="min-w-0 text-center"><p className="truncate text-sm font-extrabold text-slate-800">{lesson.title}</p><p className="text-[11px] font-semibold text-slate-400">Lesson {unitIndex + 1} · {unit.title}</p></div>
        <button type="button" onClick={() => void toggleCompleted()} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition-colors ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-primary text-white hover:bg-brand-primary-dark'}`}>{completed ? <Check size={15} /> : null}{completed ? 'Completed' : 'Mark complete'}</button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:p-5">
        <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><EBookContainer lessonId={contentContext?.lesson.id ?? lesson.id} contentLesson={contentContext?.lesson} topic={lesson.title} bookTitle={unit.courseTitle} embedded /></section>
        <div className="grid min-h-0 grid-rows-2 gap-4"><NotesBoard lesson={lesson} contentContext={contentContext} /><CompanionChat lesson={lesson} /></div>
      </div>
    </main>
  );
}
