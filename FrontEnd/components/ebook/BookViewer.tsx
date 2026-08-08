"use client";

import BookPage from "./BookPage";
import { useEffect, useRef } from "react";

interface BookPageData {
  type: 'text' | 'markdown' | 'image';
  content?: string;
  image_url?: string;
  caption?: string;
}

interface BookData {
  title: string;
  pages: BookPageData[];
}

export default function BookViewer({ book, embedded = false, initialResumePosition = 0, onProgress }: { book: BookData; embedded?: boolean; initialResumePosition?: number; onProgress?: (resumePosition: number, progressPercent: number) => void }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialResumePosition > 0 && contentRef.current) contentRef.current.scrollTop = initialResumePosition;
  }, [initialResumePosition]);

  return (
    <div className={`${embedded ? 'h-full min-h-0 px-2 py-2' : 'h-screen px-4 py-4'} flex flex-col overflow-hidden bg-slate-50`}>

      {/* Header */}
      <div className="text-center shrink-0">
        <h1 className={`${embedded ? 'text-base' : 'text-3xl'} font-bold text-slate-900`}>
          {book.title}
        </h1>
      </div>

      {/* Lesson content */}
      <div ref={contentRef} onScroll={(event) => {
        const element = event.currentTarget;
        const maxScroll = element.scrollHeight - element.clientHeight;
        const progressPercent = maxScroll > 0 ? Math.round((element.scrollTop / maxScroll) * 100) : 100;
        onProgress?.(element.scrollTop, progressPercent);
      }} className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm scrollbar-hidden">
        {book.pages.map((page, index) => (
          <BookPage key={index} page={page} pageNumber={index + 1} />
        ))}
      </div>

    </div>
  );
}
