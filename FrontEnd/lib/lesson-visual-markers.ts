import type { LessonVisual } from "@/lib/content-api";

export type LessonMarkdownSegment =
  | { type: "markdown"; content: string }
  | { type: "visual" };

/** Splits only markers outside fenced code blocks; markers in code remain code. */
export function splitLessonVisualMarkers(markdown: string): LessonMarkdownSegment[] {
  const segments: LessonMarkdownSegment[] = [];
  let inFence = false;
  const pushMarkdown = (content: string) => {
    if (!content) return;
    const previous = segments[segments.length - 1];
    if (previous?.type === "markdown") previous.content += content;
    else segments.push({ type: "markdown", content });
  };

  for (const line of markdown.split(/(?<=\n)/)) {
    const fence = /^\s*```/.test(line);
    if (!inFence && !fence) {
      let cursor = 0;
      let index = 0;
      while (index < line.length) {
        if (line[index] === "`") {
          const runStart = index;
          while (index < line.length && line[index] === "`") index += 1;
          const delimiter = line.slice(runStart, index);
          const closing = line.indexOf(delimiter, index);
          if (closing === -1) continue;
          index = closing + delimiter.length;
          continue;
        }
        if (line.startsWith("[visual]", index)) {
          if (index > cursor) pushMarkdown(line.slice(cursor, index));
          segments.push({ type: "visual" });
          index += "[visual]".length;
          cursor = index;
          continue;
        }
        index += 1;
      }
      if (cursor < line.length) pushMarkdown(line.slice(cursor));
    } else {
      pushMarkdown(line);
    }
    if (fence) inFence = !inFence;
  }

  return segments.length ? segments : [{ type: "markdown", content: markdown }];
}

export type InlineLessonSegment =
  | { type: "markdown"; content: string }
  | { type: "visual"; visual?: LessonVisual };

function paragraphUnits(content: string) {
  const parts = content.split(/(\n\s*\n)/);
  const units: string[] = [];
  for (let index = 0; index < parts.length; index += 2) {
    const unit = parts[index] + (parts[index + 1] ?? "");
    if (unit) units.push(unit);
  }
  return units;
}

/** Matches markers first, then distributes unmatched visuals at paragraph boundaries. */
export function buildInlineLessonSegments(markdown: string, visuals: LessonVisual[]): InlineLessonSegment[] {
  const orderedVisuals = [...visuals].sort((left, right) => left.position - right.position);
  const markerSegments = splitLessonVisualMarkers(markdown);
  if (!orderedVisuals.length) return markerSegments;

  const baseSegments: InlineLessonSegment[] = [];
  let matchedIndex = 0;
  for (const segment of markerSegments) {
    if (segment.type === "visual") {
      baseSegments.push({ type: "visual", visual: orderedVisuals[matchedIndex] });
      matchedIndex += 1;
    } else {
      for (const unit of paragraphUnits(segment.content)) baseSegments.push({ type: "markdown", content: unit });
    }
  }

  const extras = orderedVisuals.slice(matchedIndex);
  if (!extras.length) return baseSegments;

  const markdownLength = baseSegments.reduce((total, segment) => total + (segment.type === "markdown" ? segment.content.length : 0), 0);
  const markdownUnits = baseSegments.filter((segment) => segment.type === "markdown");
  if (!markdownUnits.length) return baseSegments;

  const result: InlineLessonSegment[] = [];
  let markdownCursor = 0;
  let extraIndex = 0;
  const maxPosition = Math.max(1, ...orderedVisuals.map((visual) => visual.position));

  for (const segment of baseSegments) {
    if (segment.type === "visual") {
      result.push(segment);
      continue;
    }
    const targetBefore = (extraIndex < extras.length && markdownLength > 0)
      ? ((extras[extraIndex].position - 1) / Math.max(1, maxPosition - 1)) * markdownLength
      : Number.POSITIVE_INFINITY;
    if (markdownCursor >= targetBefore) {
      result.push({ type: "visual", visual: extras[extraIndex] });
      extraIndex += 1;
    }
    result.push(segment);
    markdownCursor += segment.content.length;
  }

  while (extraIndex < extras.length) {
    const insertAt = Math.max(0, result.length - 1);
    result.splice(insertAt, 0, { type: "visual", visual: extras[extraIndex] });
    extraIndex += 1;
  }
  return result;
}
