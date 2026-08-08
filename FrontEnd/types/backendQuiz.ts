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
  type: string;
  number_of_qns: number;
  questions: BackendQuestion[];
}