'use client';

import { LayoutGrid, Pencil } from 'lucide-react';

export type WorkspaceMode = 'study' | 'canvas';

export default function WorkspaceToggle({ mode, onToggle }: { mode: WorkspaceMode; onToggle: () => void }) {
  const canvas = mode === 'canvas';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={canvas}
      aria-label="Toggle canvas workspace"
      title={canvas ? 'Switch to notes & chat' : 'Switch to canvas'}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition-all ${canvas ? 'border-brand-primary bg-brand-primary-bg text-brand-primary shadow-[0_0_0_3px_rgba(242,121,40,0.12)]' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-primary-tint hover:bg-brand-primary-bg hover:text-brand-primary'}`}
    >
      {canvas ? <LayoutGrid size={15} /> : <Pencil size={15} />}
      <span className="hidden sm:inline">{canvas ? 'Tools' : 'Canvas'}</span>
    </button>
  );
}
