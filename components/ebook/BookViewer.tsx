"use client";

import { useRef, useState } from "react";
import HTMLFlipBookRaw from "react-pageflip";
import BookPage from "./BookPage";
import Button from "@/components/shared/Button";

const HTMLFlipBook = HTMLFlipBookRaw as any;

export default function BookViewer({ book }: any) {
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
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 px-4 py-4">

      {/* Header */}
      <div className="text-center shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">
          {book.title}
        </h1>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mt-4 mb-4 shrink-0">

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
            border-violet-500
            rounded-3xl
            p-6
            shadow-[0_25px_80px_rgba(124,58,237,0.18)]
          "
        >

          {/* Purple Spine */}
          

          <HTMLFlipBook
            ref={bookRef}
            width={520}
            height={620}
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
                  border-violet-100
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
      <div className="flex justify-between gap-4 mt-4 shrink-0">

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