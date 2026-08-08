import { apiFetch } from "./api";

const QUIZ_API_KEY = process.env.NEXT_PUBLIC_QUIZ_API_KEY!;

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
  type: string;
  number_of_qns: number;
  questions: Question[];
}

export async function generateQuiz(params: {
  type: string;
  number_of_qns: number;
  user_interest: string;
  subject: string;
  content: string;
}): Promise<BackendQuiz> {

  const res = await apiFetch("/v1/quiz", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": QUIZ_API_KEY,
    },
    body: JSON.stringify(params),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.detail || "Quiz generation failed");
  }

  return body;
}
