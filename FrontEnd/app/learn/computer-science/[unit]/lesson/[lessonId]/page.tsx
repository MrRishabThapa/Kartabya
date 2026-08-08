'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import LessonWorkspace from '@/components/lesson-workspace/LessonWorkspace';
import ErrorState from '@/components/shared/ErrorState';
import { api } from '@/lib/api';
import { CONTENT_BOOK_SLUG, findContentLesson, unitFromContentBook } from '@/lib/content-adapter';
import type { ContentBook } from '@/lib/content-api';

export default function LessonPage() {
  const params = useParams();
  const unitId = params.unit as string;
  const lessonId = params.lessonId as string;
  const [book, setBook] = useState<ContentBook | null>(null);
  const [error, setError] = useState(false);

  const loadBook = useCallback(async () => {
    try {
      setError(false);
      const response = await api.get(`/api/v1/content/books/${CONTENT_BOOK_SLUG}`) as ContentBook;
      setBook(response);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadBook(), 0);
    return () => window.clearTimeout(requestId);
  }, [loadBook]);

  if (error) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><ErrorState title="Unable to open lesson" subtitle="The book content could not be reached." onRetry={loadBook} /></div>;
  }

  if (!book) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="animate-spin text-brand-primary" size={28} aria-label="Loading lesson" /></div>;
  }

  const match = findContentLesson(book, lessonId);
  const unit = unitFromContentBook(book, unitId);
  const lesson = unit?.lessons.find((item) => item.id === match?.lesson.id);

  if (!unit || !lesson) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><ErrorState title="Lesson not found" subtitle="This lesson is not available in the selected book." onRetry={loadBook} /></div>;
  }

  return <LessonWorkspace unit={unit} lesson={lesson} />;
}
