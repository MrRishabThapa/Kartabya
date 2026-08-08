'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import LevelTreeHeader from '@/components/level-tree-page/LevelTreeHeader';
import LevelTree from '@/components/level-tree-page/level-tree/LevelTree';
import ErrorState from '@/components/shared/ErrorState';
import { api } from '@/lib/api';
import { CONTENT_BOOK_SLUG, unitFromContentBook } from '@/lib/content-adapter';
import type { ContentBook } from '@/lib/content-api';

export default function UnitPage() {
  const params = useParams();
  const unitId = params.unit as string;
  const [book, setBook] = useState<ContentBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/api/v1/content/books/${CONTENT_BOOK_SLUG}`) as ContentBook;
      setBook(response);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load learning content.');
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => void loadBook(), 0);
    return () => window.clearTimeout(requestId);
  }, [loadBook]);

  const unit = book ? unitFromContentBook(book, unitId) : null;

  if (error) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><ErrorState title="Unable to load learning map" subtitle="The book catalog could not be reached." onRetry={loadBook} /></div>;
  }

  if (!unit) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><Loader2 className="animate-spin text-brand-primary" size={28} aria-label="Loading learning map" /></div>;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        // Subtle gradient using the unit's color
        background: `linear-gradient(to bottom, ${unit.color}08, #ffffff 30%, #ffffff)`,
      }}
    >
      <LevelTreeHeader unit={unit} />

      <main className="pb-24 pt-4">
        <LevelTree unit={unit} />
      </main>
    </div>
  );
}
