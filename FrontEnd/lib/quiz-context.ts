import { UNITS } from '@/data/lessons';

export interface QuizContext {
  subject: string;
  content: string;
  contentLabel: string;
  isLessonFocused: boolean;
}

function unitMatchesSubject(courseTitle: string, subject: string) {
  const normalized = subject.toLowerCase();
  return courseTitle.toLowerCase().includes(normalized) || normalized.includes(courseTitle.toLowerCase());
}

export function resolveQuizContext(subject: string, completedLessonIds: string[] = []): QuizContext {
  const safeSubject = subject.trim() || 'Computer Science';
  const unit = Object.values(UNITS).find((candidate) => unitMatchesSubject(candidate.courseTitle, safeSubject));
  const recentLesson = unit?.lessons
    .filter((lesson) => completedLessonIds.includes(lesson.id))
    .sort((a, b) => b.order - a.order)[0];

  if (recentLesson) {
    return {
      subject: unit?.courseTitle ?? safeSubject,
      content: recentLesson.title,
      contentLabel: recentLesson.title,
      isLessonFocused: true,
    };
  }

  return {
    subject: unit?.courseTitle ?? safeSubject,
    content: 'mixed fundamentals',
    contentLabel: `${unit?.courseTitle ?? safeSubject} fundamentals`,
    isLessonFocused: false,
  };
}
