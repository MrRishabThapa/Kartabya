'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, Loader2, StickyNote } from 'lucide-react';
import { getAllStickyNotes, type ContentStickyNote } from '@/lib/content-api';
import { toast } from 'sonner';

function readLocalNotes(): ContentStickyNote[] {
  if (typeof window === 'undefined') return [];
  const notes: ContentStickyNote[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith('adaptiv-lesson-notes:')) continue;
    try {
      const lessonNotes = JSON.parse(window.localStorage.getItem(key) || '[]') as Array<{ id: string; text: string }>;
      notes.push(...lessonNotes.map((note) => ({ id: note.id, lesson_id: key.replace('adaptiv-lesson-notes:', ''), note: note.text })));
    } catch {
      // Ignore malformed local notes.
    }
  }
  return notes;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<ContentStickyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getAllStickyNotes().then(setNotes).catch(() => {
      const localNotes = readLocalNotes();
      setNotes(localNotes);
      if (localNotes.length) toast.info('Showing locally saved notes while your account notes are unavailable.');
    }).finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const grouped = new Map<string, ContentStickyNote[]>();
    notes.forEach((note) => {
      const chapter = note.chapter_title || 'Uncategorized chapter';
      grouped.set(chapter, [...(grouped.get(chapter) ?? []), note]);
    });
    return Array.from(grouped.entries());
  }, [notes]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><StickyNote size={19} /></span>
          <div><h1 className="text-xl font-extrabold tracking-tight text-slate-800">My sticky notes</h1><p className="mt-1 text-sm text-slate-500">Everything you saved while studying, organized by chapter.</p></div>
        </div>
      </div>

      {loading ? <div className="grid min-h-48 place-items-center rounded-2xl border border-slate-200 bg-white"><Loader2 className="animate-spin text-brand-primary" size={24} /></div> : groups.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><FileText className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-bold text-slate-600">No saved notes yet</p><p className="mt-1 text-xs text-slate-400">Notes from your lessons will appear here.</p></div> : groups.map(([chapter, chapterNotes]) => (
        <section key={chapter} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3"><BookOpen size={17} className="text-brand-primary" /><div><h2 className="text-sm font-extrabold text-slate-800">{chapter}</h2><p className="text-[11px] font-semibold text-slate-400">{chapterNotes.length} {chapterNotes.length === 1 ? 'note' : 'notes'}</p></div></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {chapterNotes.map((note) => <article key={note.id} className="min-h-28 rounded-xl border border-amber-100 bg-amber-50/75 p-4"><p className="text-sm leading-6 text-slate-700">{note.note}</p><div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-slate-400"><span>{note.book_title || 'Computer'}</span><span>·</span><span>{note.topic_title || 'Lesson note'}</span>{note.lesson_title && <><span>·</span><span>{note.lesson_title}</span></>}</div></article>)}
          </div>
        </section>
      ))}
    </div>
  );
}
