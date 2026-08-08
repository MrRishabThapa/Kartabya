"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MarkdownContent from "@/components/ebook/MarkdownContent";
import type { LessonVisual } from "@/lib/content-api";
import { buildInlineLessonSegments } from "@/lib/lesson-visual-markers";

type Props = {
  markdown: string;
  visuals: LessonVisual[];
  className?: string;
};

function withResizeBridge(content: string, visualId: string) {
  const bridge = `<script>(function(){function send(){window.parent.postMessage({type:'visual-height',visualId:${JSON.stringify(visualId)},height:Math.min(document.documentElement.scrollHeight,800)},'*')}window.addEventListener('load',send);window.addEventListener('resize',send);setTimeout(send,100);})();</script>`;
  return content.includes("</body>") ? content.replace("</body>", `${bridge}</body>`) : `${content}${bridge}`;
}

function LessonVisualBlock({ visual }: { visual?: LessonVisual }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameKey, setFrameKey] = useState(0);
  const [height, setHeight] = useState(380);
  const [expanded, setExpanded] = useState(false);
  const srcDoc = visual ? withResizeBridge(visual.content, visual.id) : "";

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expanded]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<{ type?: string; visualId?: string; height?: number }>) => {
      if (event.source !== iframeRef.current?.contentWindow || event.data?.type !== "visual-height" || event.data.visualId !== visual?.id) return;
      setHeight(Math.max(380, Math.min(event.data.height ?? 380, 800)));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [visual?.id]);

  if (!visual) return null;

  return (
    <>
      <figure className="group relative my-8 overflow-hidden rounded-2xl border border-brand-primary-tint/80 bg-[#fffaf6] shadow-[0_14px_36px_-24px_rgba(194,97,32,0.4)] transition-shadow hover:shadow-[0_18px_42px_-24px_rgba(194,97,32,0.5)]">
        {visual.title && <figcaption className="px-5 pt-4 text-sm italic text-brand-primary-dark">{visual.title}</figcaption>}
        <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button type="button" onClick={() => setFrameKey((key) => key + 1)} title="Restart" aria-label="Restart visual" className="grid h-8 w-8 place-items-center rounded-full border border-brand-primary-tint bg-white/90 text-brand-primary shadow-sm hover:bg-brand-primary-bg"><RotateCcw size={14} /></button>
          <button type="button" onClick={() => setExpanded(true)} title="Expand" aria-label="Expand visual" className="grid h-8 w-8 place-items-center rounded-full border border-brand-primary-tint bg-white/90 text-brand-primary shadow-sm hover:bg-brand-primary-bg"><Maximize2 size={14} /></button>
        </div>
        <iframe
          key={frameKey}
          ref={iframeRef}
          title={visual.title || "Lesson figure"}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          loading="lazy"
          style={{ height: `${height}px` }}
          className="block min-h-[380px] w-full overflow-auto border-0 bg-transparent"
        />
      </figure>

      <AnimatePresence>
        {expanded && <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={visual.title || "Expanded lesson figure"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-brand-primary-tint bg-[#fffaf6] p-2 shadow-2xl">
            <button type="button" onClick={() => setExpanded(false)} aria-label="Close expanded visual" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-brand-primary-tint bg-white/95 text-slate-500 shadow-sm hover:bg-brand-primary-bg hover:text-brand-primary"><X size={17} /></button>
            {visual.title && <p className="px-4 pb-2 pt-2 text-sm italic text-brand-primary-dark">{visual.title}</p>}
            <iframe title={visual.title || "Lesson figure"} srcDoc={srcDoc} sandbox="allow-scripts" loading="lazy" className="block h-[80vh] max-h-[800px] min-h-[380px] w-full border-0 bg-white" />
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}

export default function LessonVisualRenderer({ markdown, visuals, className = "" }: Props) {
  const segments = useMemo(() => buildInlineLessonSegments(markdown, visuals), [markdown, visuals]);
  return <div className={className}>{segments.map((segment, index) => segment.type === "markdown" ? (segment.content ? <MarkdownContent key={`markdown-${index}`} markdown={segment.content} /> : null) : <LessonVisualBlock key={`visual-${index}`} visual={segment.visual} />)}</div>;
}

export { LessonVisualBlock };
