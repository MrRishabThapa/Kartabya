"use client";

import BookPage from "./BookPage";
import { useEffect, useRef } from "react";
import type { LessonVisual } from "@/lib/content-api";

interface BookPageData {
  type: "text" | "markdown" | "image";
  content?: string;
  image_url?: string;
  caption?: string;
  visuals?: LessonVisual[];
}

interface BookData {
  title: string;
  pages: BookPageData[];
}

export default function BookViewer({
  book,
  embedded = false,
  initialResumePosition = 0,
  onProgress,
}: {
  book: BookData;
  embedded?: boolean;
  initialResumePosition?: number;
  onProgress?: (resumePosition: number, progressPercent: number) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialResumePosition > 0 && contentRef.current)
      contentRef.current.scrollTop = initialResumePosition;
  }, [initialResumePosition]);

  return (
    <div
      className={`${embedded ? "h-full min-h-0 px-1 py-1 sm:px-2 sm:py-2" : "h-screen px-4 py-4"} flex min-h-0 flex-col overflow-hidden bg-slate-50`}
    >
      {/* Lesson content */}
      <div
        data-lesson-content
        ref={contentRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          const maxScroll = element.scrollHeight - element.clientHeight;
          const progressPercent =
            maxScroll > 0
              ? Math.round((element.scrollTop / maxScroll) * 100)
              : 100;
          onProgress?.(element.scrollTop, progressPercent);
        }}
        className="adaptiv-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {book.pages.map((page, index) => (
          <BookPage key={index} page={page} pageNumber={index + 1} />
        ))}
      </div>
    </div>
  );
}
