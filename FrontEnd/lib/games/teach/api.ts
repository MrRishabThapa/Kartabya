import { API_URL, ApiError, api } from '@/lib/api';
import { getContentBook } from '@/lib/content-api';
import type { CompletedTeachLesson, TeachGrade, TeachResult, TeachSession, TeachSessionStart, TeachTopic } from './types';

const mockTopics: TeachTopic[] = [
  { id: 'binary-search', title: 'Binary search', description: 'Explain how sorted data helps you find values faster.', subject: 'Computer Science', difficulty: 'Intermediate' },
  { id: 'newtons-laws', title: "Newton's laws", description: 'Teach the three laws of motion with a simple example.', subject: 'Physics', difficulty: 'Beginner' },
  { id: 'photosynthesis', title: 'Photosynthesis', description: 'Describe how plants turn light into energy.', subject: 'Biology', difficulty: 'Beginner' },
  { id: 'fractions', title: 'Adding fractions', description: 'Explain why denominators need to match.', subject: 'Mathematics', difficulty: 'Beginner' },
];

const mockEnabled = process.env.NEXT_PUBLIC_TEACH_MOCK !== 'false';

function shouldMock(error: unknown) {
  return mockEnabled && error instanceof ApiError && [404, 501].includes(error.status);
}

export async function getTeachTopics(subjectId?: string) {
  try {
    const query = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return await api.get(`/api/v1/games/teach/topics${query}`) as TeachTopic[];
  } catch (error) {
    if (shouldMock(error)) return mockTopics;
    throw error;
  }
}

export async function startTeachSession(topicId?: string) {
  try {
    return await api.post('/api/v1/games/teach/sessions', topicId ? { topic_id: topicId } : {}) as TeachSession;
  } catch (error) {
    if (shouldMock(error)) {
      const topic = topicId ? mockTopics.find((item) => item.id === topicId) ?? mockTopics[0] : mockTopics[Math.floor(Math.random() * mockTopics.length)];
      return { session_id: `demo-${Date.now()}`, topic };
    }
    throw error;
  }
}

export async function submitTeachSession(sessionId: string, transcript: string) {
  try {
    return await api.post(`/api/v1/games/teach/sessions/${encodeURIComponent(sessionId)}/submit`, { transcript }) as TeachResult;
  } catch (error) {
    if (shouldMock(error)) {
      const accuracy = Math.min(98, Math.max(42, Math.round(55 + transcript.length / 8)));
      return {
        accuracy_percent: accuracy,
        band: accuracy >= 90 ? 'great' : accuracy >= 70 ? 'good' : 'miss',
        xp_earned: accuracy >= 90 ? 25 : accuracy >= 70 ? 10 : 2,
        feedback: {
          correct_points: transcript.length > 100 ? ['You explained the main idea clearly.'] : [],
          missing_points: ['Add a concrete example to make the idea easier to remember.'],
          incorrect_points: [],
          praise_or_tip: 'Good effort. Try connecting the concept to something familiar next time.',
        },
        correct_answer: 'A strong explanation defines the idea, explains how it works, and gives a useful example.',
      } satisfies TeachResult;
    }
    throw error;
  }
}

export function createTeachSession(lessonId: string) {
  return api.post('/api/v1/teach/sessions', { lesson_id: lessonId }) as Promise<TeachSessionStart>;
}

export async function getCompletedTeachLessons(): Promise<CompletedTeachLesson[]> {
  const book = await getContentBook('computer');
  const lessons = (book.chapters ?? []).flatMap((chapter) =>
    (chapter.topics ?? []).flatMap((topic) =>
      (topic.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        topic: topic.title,
        subject: book.title,
      })),
    ),
  );

  const completed = await Promise.all(lessons.map(async (lesson) => {
    try {
      const progress = await api.get(`/api/v1/content/lessons/${encodeURIComponent(lesson.id)}/progress`) as { completed?: boolean };
      return progress.completed ? lesson : null;
    } catch {
      return null;
    }
  }));

  return completed.filter((lesson): lesson is CompletedTeachLesson => lesson !== null);
}

export function getTeachGrade(sessionId: string) {
  return api.get(`/api/v1/teach/sessions/${encodeURIComponent(sessionId)}/grade`) as Promise<TeachGrade>;
}

export function teachWebSocketUrl(ticket: string) {
  const base = new URL(API_URL);
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${base.host}/api/v1/teach/chat?ticket=${encodeURIComponent(ticket)}&ngrok-skip-browser-warning=true`;
}
