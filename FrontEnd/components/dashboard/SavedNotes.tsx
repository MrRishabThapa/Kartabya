'use client';

import { useState } from 'react';
import { FileText, StickyNote } from 'lucide-react';

interface SavedNote {
  id: string;
  text: string;
}

function readSavedNotes(): SavedNote[] {
  if (typeof window === 'undefined') return [];
  const saved: SavedNote[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith('adaptiv-lesson-notes:')) continue;
    try {
      const notes = JSON.parse(window.localStorage.getItem(key) || '[]') as SavedNote[];
      saved.push(...notes);
    } catch {
      // Ignore malformed local notes and keep the dashboard usable.
    }
  }
  return saved.slice(-4).reverse();
}

export default function SavedNotes() {
  const [notes] = useState<SavedNote[]>(readSavedNotes);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600"><StickyNote size={16} /></span><h2 className="text-sm font-extrabold text-slate-800">Saved notes</h2></div>
        <FileText size={16} className="text-slate-300" />
      </div>
      {notes.length > 0 ? <div className="mt-4 space-y-2">{notes.map((note) => <p key={note.id} className="line-clamp-2 rounded-xl bg-amber-50/70 px-3 py-2 text-xs leading-5 text-slate-600">{note.text}</p>)}</div> : <p className="mt-4 text-xs leading-5 text-slate-500">Sticky notes you make during lessons will appear here.</p>}
    </section>
  );
}
