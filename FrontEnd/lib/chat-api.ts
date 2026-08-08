import { api } from '@/lib/api';
import type { LessonVisual } from '@/lib/content-api';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  visuals?: LessonVisual[];
};

export type ChatSession = {
  id: string;
  lesson_id: string;
  lesson_title: string;
  created_at: string;
  updated_at: string;
};

export type ChatSessionDetail = ChatSession & { messages: ChatMessage[] };

export type ChatTurn = {
  session_id: string;
  lesson_id: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
};

export function listChatSessions() {
  return api.get('/api/v1/chat/sessions') as Promise<ChatSession[]>;
}

export function getChatSession(sessionId: string) {
  return api.get(`/api/v1/chat/sessions/${encodeURIComponent(sessionId)}`) as Promise<ChatSessionDetail>;
}

export function createChatSession(lessonId: string) {
  return api.post('/api/v1/chat/sessions', { lesson_id: lessonId }) as Promise<ChatSession>;
}

export function sendChatMessage(sessionId: string, message: string, selectedText?: string | null) {
  return api.post(`/api/v1/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    message,
    selected_text: selectedText || undefined,
  }) as Promise<ChatTurn>;
}
