export type TeachBand = 'great' | 'bullseye' | 'good' | 'miss';

export interface TeachTopic {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | string;
}

export interface CompletedTeachLesson {
  id: string;
  title: string;
  topic: string;
  subject: string;
}

export interface TeachSession {
  session_id: string;
  topic: TeachTopic;
}

export interface TeachSessionStart {
  chat_session_id: string;
  ticket: string;
  expires_in: number;
}

export interface TeachGrade {
  chat_session_id: string;
  score: number;
  passed: boolean;
  feedback: string | TeachFeedback;
  strengths: string[];
  misconceptions: string[];
  xp_awarded: number;
  graded_at: string;
  correct_answer?: string;
}

export type TeachConnectionPhase = 'idle' | 'connecting' | 'explaining' | 'qna' | 'grading' | 'result' | 'failed';
export type TeachPhase = TeachConnectionPhase | 'recording' | 'transcribing' | 'evaluating' | 'graded';

export interface TeachFeedback {
  correct_points: string[];
  missing_points: string[];
  incorrect_points: string[];
  praise_or_tip: string;
}

export interface TeachResult {
  accuracy_percent: number;
  band: TeachBand;
  xp_earned: number;
  feedback: TeachFeedback;
  correct_answer: string;
}

export interface TeachMessage {
  id: string;
  sender: 'companion' | 'user';
  text: string;
}
