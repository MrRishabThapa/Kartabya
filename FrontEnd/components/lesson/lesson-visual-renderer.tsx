"use client";

import { useMemo } from "react";
import MarkdownContent from "@/components/ebook/MarkdownContent";
import type { LessonVisual } from "@/lib/content-api";
import { splitLessonVisualMarkers } from "@/lib/lesson-visual-markers";

type Props = {
  markdown: string;
  visuals: LessonVisual[];
  className?: string;
};

function LessonVisualBlock({ visual, number }: { visual?: LessonVisual; number: number }) {
  if (!visual) {
    return <div className="my-6 rounded-2xl border border-dashed border-brand-primary-tint bg-brand-primary-bg px-4 py-3 text-sm text-slate-500">Visual not available.</div>;
  }

  return (
    <figure className="my-7 overflow-hidden rounded-2xl border border-brand-primary-tint bg-[#fffaf6] shadow-[0_12px_30px_rgba(194,97,32,0.08)]">
      <figcaption className="flex flex-wrap items-center gap-2 border-b border-brand-primary-tint bg-white/70 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">
        <span className="rounded-lg bg-brand-primary px-2 py-1 text-[10px] text-white">Visual {number}</span>
        {visual.title && <span>{visual.title}</span>}
        {!visual.title && <span>Interactive lesson visual</span>}
      </figcaption>
      <iframe
        title={visual.title || "Interactive lesson visual"}
        srcDoc={visual.content}
        sandbox="allow-scripts"
        loading="lazy"
        className="block min-h-[320px] w-full border-0 bg-white sm:min-h-[380px]"
      />
    </figure>
  );
}

export default function LessonVisualRenderer({ markdown, visuals, className = "" }: Props) {
  const orderedVisuals = useMemo(() => [...visuals].sort((left, right) => left.position - right.position), [visuals]);
  const segments = useMemo(() => splitLessonVisualMarkers(markdown), [markdown]);
  const markerCount = segments.filter((segment) => segment.type === "visual").length;

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "markdown") {
          return segment.content ? <MarkdownContent key={`markdown-${index}`} markdown={segment.content} /> : null;
        }
        const number = segments.slice(0, index + 1).filter((item) => item.type === "visual").length;
        return <LessonVisualBlock key={`visual-${index}`} visual={orderedVisuals[number - 1]} number={number} />;
      })}

      {orderedVisuals.length > markerCount && (
        <section className="mt-8 border-t border-brand-primary-tint pt-6" aria-label="Additional visuals">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Additional visuals</p>
          {orderedVisuals.slice(markerCount).map((visual, index) => (
            <LessonVisualBlock key={`additional-${visual.id}`} visual={visual} number={markerCount + index + 1} />
          ))}
        </section>
      )}
    </div>
  );
}

export { LessonVisualBlock };
