export interface BackendOption {
  option: string;       // "A"
  text: string;         // Option text
  description: string;  // Explanation
}

export interface BackendQuestion {
  number: number;
  question: string;
  options: BackendOption[];
  answer: string;       // Correct letter
}

export interface BackendQuiz {
  id: string;
  type: string;
  number_of_qns: number;
  base_pass_marks?: number;
  questions: BackendQuestion[];
}

export interface QuizAttemptResult {
  attempt_id: string;
  score: number;
  total: number;
  passed: boolean;
  pass_mark_percent: number;
  xp_earned: number;
  xp_penalty: number;
  total_xp: number;
}
