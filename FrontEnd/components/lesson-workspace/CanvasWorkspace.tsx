'use client';

import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import '@/styles/tldraw-theme.css';

export function CanvasWorkspace({ lessonId }: { lessonId: string }) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf4] shadow-sm">
      <Tldraw persistenceKey={`adaptiv:canvas:${lessonId}`} />
    </div>
  );
}
