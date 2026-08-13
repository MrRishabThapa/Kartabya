"use client";
import LessonVisualRenderer from "@/components/lesson/lesson-visual-renderer";
import type { LessonVisual } from "@/lib/content-api";

interface Props {
  page: {
    type: "text" | "markdown" | "image";
    content?: string;
    image_url?: string;
    caption?: string;
    visuals?: LessonVisual[];
  };
  pageNumber: number;
  onNext?: () => void;
}

export default function BookPage({ page, pageNumber, onNext }: Props) {
  return (
    <div
      className="
        h-full
        relative
        px-6
        py-8
        sm:px-10
        sm:py-10
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
      <div className="mx-auto w-full max-w-[78ch] select-text cursor-text">
        {page.type === "text" && (
          <p className="text-lg leading-9 text-slate-700">
            {page.content ?? ""}
          </p>
        )}

        {page.type === "markdown" && (
          <LessonVisualRenderer
            markdown={page.content ?? ""}
            visuals={page.visuals ?? []}
          />
        )}

        {page.type === "image" && (
          <div className="space-y-6">
            <img
              src={page.image_url ?? ""}
              alt=""
              className="
                w-full
                rounded-xl
                border
                border-slate-100
              "
            />

            <p className="text-sm text-slate-500 italic">
              {page.caption ?? ""}
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
