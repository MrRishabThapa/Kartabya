import type { ContentBook } from '@/lib/content-api';
import type { Lesson, Unit } from '@/types/lessons-types';

export const CONTENT_BOOK_SLUG = 'computer';

const CHAPTER_BY_UNIT: Record<string, string> = {
  networking: 'data-communication-and-networking',
  database: 'database-management-system-dbms',
  'web-technology': 'web-technology-ii',
};

const UNIT_STYLE: Record<string, { color: string; accentColor: string; title: string }> = {
  networking: { color: '#2DD4BF', accentColor: '#0F766E', title: 'Antenna District' },
  database: { color: '#60A5FA', accentColor: '#1D4ED8', title: 'Vault District' },
  'web-technology': { color: '#F5A623', accentColor: '#B87908', title: 'Web Harbor' },
};

export function getUnitIdForChapter(chapterSlug: string) {
  return Object.entries(CHAPTER_BY_UNIT).find(([, slug]) => slug === chapterSlug)?.[0] ?? chapterSlug;
}

export function unitFromContentBook(book: ContentBook, unitId: string): Unit | null {
  const chapterSlug = CHAPTER_BY_UNIT[unitId] ?? unitId;
  const chapter = book.chapters?.find((item) => item.slug === chapterSlug);
  if (!chapter) return null;
  const style = UNIT_STYLE[unitId] ?? { color: '#60A5FA', accentColor: '#1D4ED8', title: chapter.title };
  let order = 0;
  let previousLessonId: string | undefined;
  const lessons: Lesson[] = (chapter.topics ?? []).flatMap((topic) => (topic.lessons ?? []).map((contentLesson) => {
    order += 1;
    const lesson: Lesson = {
      id: contentLesson.id,
      unitId,
      title: contentLesson.title,
      description: topic.title,
      order,
      type: 'lesson',
      hasQuiz: false,
      xpReward: 10,
      prerequisiteIds: previousLessonId ? [previousLessonId] : [],
      estimatedMinutes: 20,
    };
    previousLessonId = lesson.id;
    return lesson;
  }));
  return {
    id: unitId,
    title: style.title,
    courseTitle: book.title,
    color: style.color,
    accentColor: style.accentColor,
    lessons,
  };
}

export function findContentLesson(book: ContentBook, lessonId: string) {
  for (const chapter of book.chapters ?? []) {
    for (const topic of chapter.topics ?? []) {
      const lesson = topic.lessons?.find((item) => item.id === lessonId || item.slug === lessonId);
      if (lesson) return { chapter, topic, lesson };
    }
  }
  return null;
}
