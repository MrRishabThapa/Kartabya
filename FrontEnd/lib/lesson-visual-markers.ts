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
