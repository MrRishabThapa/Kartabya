import { api } from '@/lib/api';

export interface ContentLesson {
  id: string;
  title: string;
  slug: string;
  filename: string;
  position: number;
  markdown: string;
  content_type: string;
  book_slug: string;
  chapter_slug: string;
  topic_slug: string;
}

export interface ContentContext {
  classId?: string;
  classSlug: string;
  bookId: string;
  lesson: ContentLesson;
}

export interface ContentBookSummary {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  editor: boolean;
  interactive: boolean;
}

export interface ContentBook {
  id: string;
  title: string;
  slug: string;
  chapters?: Array<{
    id: string;
    title: string;
    slug: string;
    position: number;
    topics?: Array<{
      id: string;
      title: string;
      slug: string;
      position: number;
      lessons?: Array<{ id: string; title: string; slug: string }>;
    }>;
  }>;
}

function findLesson(book: ContentBook, lessonId: string, title: string) {
  const normalizedTitle = title.trim().toLowerCase();
  for (const chapter of book.chapters ?? []) {
    for (const topic of chapter.topics ?? []) {
      const lesson = (topic.lessons ?? []).find((item) => item.id === lessonId || item.title.trim().toLowerCase() === normalizedTitle);
      if (lesson) return { lesson, chapter, topic };
    }
  }
  return null;
}

export async function listContentBooks() {
  return api.get('/api/v1/content/books') as Promise<ContentBookSummary[]>;
}

export async function getContentBook(bookSlug: string) {
  return api.get(`/api/v1/content/books/${encodeURIComponent(bookSlug)}`) as Promise<ContentBook>;
}

export async function getContentLessonByPath(bookSlug: string, chapterSlug: string, topicSlug: string, lessonSlug: string) {
  return api.get(`/api/v1/content/books/${encodeURIComponent(bookSlug)}/chapters/${encodeURIComponent(chapterSlug)}/topics/${encodeURIComponent(topicSlug)}/lessons/${encodeURIComponent(lessonSlug)}/content`) as Promise<ContentLesson>;
}

export interface PersonalizedLesson {
  id: string;
  lesson_id: string;
  lesson_title: string;
  filename: string;
  markdown: string;
  content_type: string;
  subject?: string;
  grade?: string;
  hobbies?: string[];
  interests?: string[];
  resume_position: number;
  progress_percent: number;
  completed: boolean;
  reused: boolean;
}

export async function getPersonalizedLesson(lessonId: string) {
  return api.get(`/api/v1/content/lessons/${encodeURIComponent(lessonId)}/personalized`) as Promise<PersonalizedLesson>;
}

export async function personalizeLesson(lessonId: string) {
  return api.post(`/api/v1/content/lessons/${encodeURIComponent(lessonId)}/personalized`, {
    request: '',
    force_regenerate: false,
  }) as Promise<PersonalizedLesson>;
}

export async function savePersonalizedProgress(personalizedLessonId: string, resumePosition: number, progressPercent: number) {
  return api.put(`/api/v1/content/personalized-lessons/${encodeURIComponent(personalizedLessonId)}/progress`, {
    resume_position: resumePosition,
    progress_percent: progressPercent,
    completed: progressPercent >= 100,
  });
}

export async function resolveContentContext(lessonId: string, title: string, bookHint?: string, classSlug = 'computer-science'): Promise<ContentContext | null> {
  const books = await listContentBooks();
  const normalizedHint = bookHint?.trim().toLowerCase();
  const orderedBooks = [...books].sort((left, right) => {
    if (!normalizedHint) return 0;
    const leftMatch = left.title.toLowerCase() === normalizedHint || left.slug === normalizedHint;
    const rightMatch = right.title.toLowerCase() === normalizedHint || right.slug === normalizedHint;
    return Number(rightMatch) - Number(leftMatch);
  });

  for (const book of orderedBooks) {
    const hierarchy = await getContentBook(book.slug);
    const match = findLesson(hierarchy, lessonId, title);
    if (match) {
      const lesson = await getContentLessonByPath(book.slug, match.chapter.slug, match.topic.slug, match.lesson.slug);
      let classId: string | undefined;
      try {
        const contentClass = await api.get(`/api/v1/content/classes/${encodeURIComponent(classSlug)}`) as { id?: string };
        classId = contentClass.id;
      } catch {
        // Class metadata is only needed for sticky-note writes; reading still works without it.
      }
      return { classId, classSlug, bookId: book.id, lesson };
    }
  }

  return null;
}

export interface ContentStickyNote {
  id: string;
  lesson_id: string;
  note: string;
  class_title?: string | null;
  book_title?: string | null;
  chapter_title?: string | null;
  topic_title?: string | null;
  lesson_title?: string | null;
  selected_text?: string | null;
  anchor_start?: number | null;
  anchor_end?: number | null;
}

export async function getLessonStickyNotes(lessonId: string) {
  return api.get(`/api/v1/content/sticky-notes?lesson_id=${encodeURIComponent(lessonId)}`) as Promise<ContentStickyNote[]>;
}

export async function getAllStickyNotes() {
  return api.get('/api/v1/content/sticky-notes') as Promise<ContentStickyNote[]>;
}
