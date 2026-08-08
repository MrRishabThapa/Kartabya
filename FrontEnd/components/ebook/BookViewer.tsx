"use client";

import { useRef, useState } from "react";
import HTMLFlipBookRaw from "react-pageflip";
import BookPage from "./BookPage";
import Button from "@/components/shared/Button";

const HTMLFlipBook = HTMLFlipBookRaw as any;

export default function BookViewer({ book, embedded = false }: any) {
  const bookRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
 

  const totalPages = book.pages.length;

  const nextPage = () => {
    bookRef.current?.pageFlip()?.flipNext();
  };

  const prevPage = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  return (
    <div className={`${embedded ? 'h-full min-h-0 px-2 py-2' : 'h-screen px-4 py-4'} flex flex-col overflow-hidden bg-slate-50`}>

      {/* Header */}
      <div className="text-center shrink-0">
        <h1 className={`${embedded ? 'text-base' : 'text-3xl'} font-bold text-slate-900`}>
          {book.title}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="mt-2 mb-2 flex shrink-0 items-center justify-between">

        <div className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </div>

      </div>

    
     
      

      {/* Book */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">

        <div
          className="
            relative
            bg-white
            border-4
            border-brand-primary
            rounded-3xl
            p-6
            shadow-[0_25px_80px_rgba(124,58,237,0.18)]
          "
        >

          {/* Brand spine */}
          

          <HTMLFlipBook
            ref={bookRef}
            width={embedded ? 315 : 520}
            height={embedded ? 385 : 620}
            size="fixed"
            drawShadow={true}
            flippingTime={800}

            // KEY CHANGE
            useMouseEvents={false}

            mobileScrollSupport={true}
            showCover={true}
            className="relative z-10"
            onFlip={(e: any) => {
              setCurrentPage(e.data + 1);
            }}
          >
            {book.pages.map((page: any, index: number) => (
              <div
                key={index}
                className="
                  bg-white
                  border
                  border-brand-primary-tint
                  shadow-[0_10px_40px_rgba(124,58,237,0.10)]
                "
              >
                <BookPage
                  page={page}
                  pageNumber={index + 1}
                  onNext={nextPage}
                />
              </div>
            ))}
          </HTMLFlipBook>

        </div>
      </div>

      {/* Controls */}
      <div className="mt-2 flex shrink-0 justify-between gap-2">

        <Button onClick={prevPage}>
          Previous Page
        </Button>

        <Button onClick={nextPage}>
          Next Page
        </Button>

      </div>
    </div>
  );
}
