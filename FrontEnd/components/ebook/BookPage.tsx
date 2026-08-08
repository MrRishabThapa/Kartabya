"use client";
import ReactMarkdown from 'react-markdown';

interface Props {
  page: {
    type: 'text' | 'markdown' | 'image';
    content?: string;
    image_url?: string;
    caption?: string;
  };
  pageNumber: number;
  onNext?: () => void;
}

export default function BookPage({
  page,
  pageNumber,
  onNext,
}: Props) {
  return (
    <div
      className="
        h-full
        relative
        px-10
        py-12
        text-slate-800
        bg-gradient-to-br
        from-white
        to-slate-50
      "
    >
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest font-bold text-brand-primary">
          Adaptiv
        </div>
      </div>

      {/* Content */}
      <div className="select-text cursor-text">

        {page.type === "text" && (
          <p className="text-lg leading-9 text-slate-700">
            {page.content ?? ''}
          </p>
        )}

        {page.type === "markdown" && <div className="markdown-lesson-content"><ReactMarkdown>{page.content ?? ''}</ReactMarkdown></div>}

        {page.type === "image" && (
          <div className="space-y-6">
            <img
              src={page.image_url ?? ''}
              alt=""
              className="
                w-full
                rounded-xl
                border
                border-slate-100
              "
            />

            <p className="text-sm text-slate-500 italic">
              {page.caption ?? ''}
            </p>
          </div>
        )}
      </div>

      {/* Page Corner */}
      {onNext && (
        <button
          onClick={onNext}
          className="
            absolute
            bottom-0
            right-0
            w-28
            h-28
            group
          "
          aria-label="Turn page"
        >
          <div
            className="
              absolute
              bottom-0
              right-0
              w-16
              h-16
              bg-gradient-to-tl
              from-brand-primary-tint
              to-transparent
              clip-path-page-corner
              transition-all
              duration-300
              group-hover:scale-110
            "
          />

          <div
            className="
              absolute
              bottom-5
              right-5
              text-brand-primary
              text-xs
              font-bold
            "
          >
            →
          </div>
        </button>
      )}

      {/* Footer */}
      <div
        className="
          absolute
          bottom-6
          left-0
          right-0
          text-center
          text-xs
          text-slate-400
        "
      >
        Page {pageNumber}
      </div>
    </div>
  );
}
