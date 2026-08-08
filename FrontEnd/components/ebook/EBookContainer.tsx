"use client";

import { useEffect, useState } from "react";
import {api} from "@/lib/api";
import BookViewer from "./BookViewer";
import BookSkeleton from "./BookSkeletonLoader";
import ErrorState from "@/components/shared/ErrorState";

interface Props {
  topic?: string;
  embedded?: boolean;
}

export default function EBookContainer({ topic = "arrays", embedded = false }: Props) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = await api.get(`/book?topic=${encodeURIComponent(topic)}`);

      setBook(res.data);
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.detail || "Book generation failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
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
            title="Unable to open book"
            subtitle={error}
            onRetry={fetchBook}
          />
        </div>
      )}

      {/* Book */}
      {!loading && !error && book && <BookViewer book={book} embedded={embedded} />}
    </div>
  );
}
