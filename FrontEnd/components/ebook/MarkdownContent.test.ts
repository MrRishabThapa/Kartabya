import assert from "node:assert/strict";
import test from "node:test";
// Node's native TypeScript runner needs the extension; the app bundler resolves the same module normally.
// @ts-expect-error Native Node test import with explicit TypeScript extension.
import { splitLessonVisualMarkers } from "../../lib/lesson-visual-markers.ts";

test("keeps markdown unchanged when there are no visuals", () => {
  assert.deepEqual(splitLessonVisualMarkers("# Lesson\n\nPlain **markdown**."), [
    { type: "markdown", content: "# Lesson\n\nPlain **markdown**." },
  ]);
});

test("splits one and multiple visual markers in order", () => {
  assert.deepEqual(splitLessonVisualMarkers("Before\n[visual]\nBetween [visual]\nAfter"), [
    { type: "markdown", content: "Before\n" },
    { type: "visual" },
    { type: "markdown", content: "\nBetween " },
    { type: "visual" },
    { type: "markdown", content: "\nAfter" },
  ]);
});

test("leaves visual markers inside fenced code blocks as code", () => {
  assert.deepEqual(splitLessonVisualMarkers("```md\n[visual]\n```\n\n[visual]"), [
    { type: "markdown", content: "```md\n[visual]\n```\n\n" },
    { type: "visual" },
  ]);
});

test("leaves visual markers inside inline code as code", () => {
  assert.deepEqual(splitLessonVisualMarkers("Use `[visual]` literally, then [visual]."), [
    { type: "markdown", content: "Use `[visual]` literally, then " },
    { type: "visual" },
    { type: "markdown", content: "." },
  ]);
});

test("supports fewer or more visuals without changing marker parsing", () => {
  const segments = splitLessonVisualMarkers("[visual]\n[visual]\n[visual]");
  assert.equal(segments.filter((segment) => segment.type === "visual").length, 3);
  assert.equal(segments.filter((segment) => segment.type === "markdown").map((segment) => segment.type === "markdown" ? segment.content : "").join(""), "\n\n");
});
