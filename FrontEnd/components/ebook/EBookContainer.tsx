"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import BookViewer from "./BookViewer";
import BookSkeleton from "./BookSkeletonLoader";
import ErrorState from "@/components/shared/ErrorState";
import { getPersonalizedLesson, personalizeLesson, resolveContentContext, savePersonalizedProgress, type ContentLesson } from '@/lib/content-api';

interface Props {
  topic?: string;
  bookTitle?: string;
  lessonId?: string;
  contentLesson?: ContentLesson | null;
  embedded?: boolean;
}

interface ViewerBook {
  title: string;
  pages: Array<{ type: 'text' | 'markdown' | 'image'; content?: string; image_url?: string; caption?: string }>;
  personalizedLessonId?: string;
  resumePosition?: number;
}

function markdownPages(markdown: string): Array<{ type: 'markdown'; content: string }> {
  const chunks = markdown.split(/\n(?=# )/g).filter(Boolean);
  return (chunks.length ? chunks : [markdown]).map((content) => ({ type: 'markdown', content }));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function getContentError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Please sign in again to load your personalized lesson.';
    if (error.status === 404) return 'This lesson or personalized content could not be found.';
    if (error.status === 502) return 'Personalized lesson generation is temporarily unavailable. Please try again.';
  }
  return error instanceof Error ? error.message : 'Could not load personalized lesson.';
}

export default function EBookContainer({ topic = "arrays", bookTitle, lessonId, contentLesson, embedded = false }: Props) {
  const [book, setBook] = useState<ViewerBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const progressTimer = useRef<number | null>(null);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response: ContentLesson | { data: ViewerBook };
      if (lessonId) {
        let resolvedLessonId = lessonId;
        if (contentLesson) {
          resolvedLessonId = contentLesson.id;
        } else if (isUuid(lessonId)) {
          resolvedLessonId = lessonId;
        } else {
          const context = await resolveContentContext(lessonId, topic, bookTitle);
          if (!context) throw new Error('Lesson content could not be found.');
          resolvedLessonId = context.lesson.id;
        }
        let personalizedLesson;
        try {
          personalizedLesson = await getPersonalizedLesson(resolvedLessonId);
        } catch (personalizedError) {
          if (!(personalizedError instanceof ApiError) || personalizedError.status !== 404) throw personalizedError;
          personalizedLesson = await personalizeLesson(resolvedLessonId);
        }
        setBook({ title: personalizedLesson.lesson_title, pages: markdownPages(personalizedLesson.markdown), personalizedLessonId: personalizedLesson.id, resumePosition: personalizedLesson.resume_position });
        return;
      } else {
        response = await api.get(`/book?topic=${encodeURIComponent(topic)}`) as { data: ViewerBook };
      }

      setBook((response as { data: ViewerBook }).data);
    } catch (err: unknown) {
      setError(lessonId ? getContentError(err) : err instanceof Error ? err.message : "Book generation failed.");
    } finally {
      setLoading(false);
    }
  }, [bookTitle, contentLesson, lessonId, topic]);

  useEffect(() => {
    const requestId = window.setTimeout(() => void fetchBook(), 0);
    return () => window.clearTimeout(requestId);
  }, [fetchBook]);

  const saveProgress = useCallback((resumePosition: number, progressPercent: number) => {
    if (!book?.personalizedLessonId) return;
    if (progressTimer.current) window.clearTimeout(progressTimer.current);
    progressTimer.current = window.setTimeout(() => {
      void savePersonalizedProgress(book.personalizedLessonId as string, resumePosition, progressPercent).catch(() => undefined);
    }, 500);
  }, [book]);

  useEffect(() => () => {
    if (progressTimer.current) window.clearTimeout(progressTimer.current);
  }, []);

  return (
    <div className={embedded ? "h-full min-h-0 bg-slate-50" : "min-h-screen bg-slate-50"}>
      {/* Loading */}
      {loading && (
        <div className={embedded ? "h-full p-4" : "max-w-6xl mx-auto px-4 py-10"}>
          <BookSkeleton />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={embedded ? "h-full p-4" : "max-w-4xl mx-auto px-4 py-10"}>
          <ErrorState
            title={lessonId ? 'Unable to load personalized lesson' : 'Unable to open book'}
            subtitle={error}
            onRetry={fetchBook}
          />
        </div>
      )}

      {/* Book */}
      {!loading && !error && book && <BookViewer book={book} embedded={embedded} initialResumePosition={book.resumePosition} onProgress={saveProgress} />}
    </div>
  );
}
