import assert from "node:assert/strict";
import test from "node:test";
// Node's native TypeScript runner needs the extension; the app bundler resolves the same module normally.
// @ts-expect-error Native Node test import with explicit TypeScript extension.
import { buildInlineLessonSegments, splitLessonVisualMarkers } from "../../lib/lesson-visual-markers.ts";

const visual = (id: string, position: number) => ({ id, lesson_id: "lesson-1", content: `<p>${id}</p>`, position });

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

test("matches visuals inline and distributes extras instead of appending them", () => {
  const segments = buildInlineLessonSegments("First paragraph.\n\n[visual]\n\nSecond paragraph.", [visual("first", 1), visual("extra", 2)]);
  const visualSegments = segments.filter((segment) => segment.type === "visual");
  assert.equal(visualSegments.length, 2);
  assert.equal(visualSegments[0].type === "visual" ? visualSegments[0].visual?.id : "", "first");
  assert.equal(visualSegments[1].type === "visual" ? visualSegments[1].visual?.id : "", "extra");
  assert.notEqual(segments[segments.length - 1].type, "visual");
});

test("auto-inserts visuals when markdown has no markers", () => {
  const segments = buildInlineLessonSegments("Opening.\n\nMiddle.\n\nClosing.", [visual("figure", 2)]);
  assert.equal(segments.filter((segment) => segment.type === "visual").length, 1);
  assert.ok(segments.some((segment) => segment.type === "markdown" && segment.content.includes("Opening.")));
});
