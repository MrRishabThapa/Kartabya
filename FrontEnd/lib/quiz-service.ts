import { api } from "./api";

export interface Option {
  option: "A" | "B" | "C" | "D";
  text: string;
  description: string;
}

export interface Question {
  number: number;
  question: string;
  options: Option[];
  answer: string;
}

export interface BackendQuiz {
  id: string;
  type: string;
  number_of_qns: number;
  base_pass_marks?: number;
  questions: Question[];
}

export interface QuizAttempt {
  attempt_id: string;
  score: number;
  total: number;
  passed: boolean;
  pass_mark_percent: number;
  xp_earned: number;
  xp_penalty: number;
  total_xp: number;
}

export async function generateQuiz(params: {
  type: string;
  number_of_qns: number;
  user_interest: string;
  subject: string;
  content: string;
}): Promise<BackendQuiz> {
  return api.post("/v1/quiz", params);
}

export function submitQuizAttempt(
  quizId: string,
  answers: Array<{ number: number; selected: string | null }>,
): Promise<QuizAttempt> {
  return api.post(`/v1/quiz/${quizId}/attempt`, { answers });
}
