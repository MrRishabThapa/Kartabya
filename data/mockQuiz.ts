export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
   
}

export interface QuizQuestion {
  id: string;
  question: string;
  explanation: string;
  options: QuizOption[];
}
export const mockQuiz: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the time complexity of appending to a dynamic array?",
    explanation:
      "Appending is O(1) amortized because resizing happens infrequently.",
    options: [
      { id: "a", text: "O(n)", isCorrect: false },
      { id: "b", text: "O(1) amortized", isCorrect: true },
      { id: "c", text: "O(log n)", isCorrect: false },
      { id: "d", text: "O(n²)", isCorrect: false },
    ],
  },
  {
    id: "q2",
    question: "Why does a dynamic array double in size?",
    explanation:
      "Doubling ensures amortized constant time complexity.",
    options: [
      { id: "a", text: "To reduce memory", isCorrect: false },
      { id: "b", text: "To avoid copying", isCorrect: false },
      { id: "c", text: "To maintain O(1) amortized append", isCorrect: true },
      { id: "d", text: "For aesthetics", isCorrect: false },
    ],
  },

  

  {
    id: "q3",
    question: "Which data structure follows the LIFO principle?",
    explanation:
      "Stack follows Last In First Out (LIFO) principle.",
    options: [
      { id: "a", text: "Queue", isCorrect: false },
      { id: "b", text: "Array", isCorrect: false },
      { id: "c", text: "Stack", isCorrect: true },
      { id: "d", text: "Linked List", isCorrect: false },
    ],
  },
  {
    id: "q4",
    question: "Which SQL command is used to retrieve data from a table?",
    explanation:
      "The SELECT statement is used to retrieve data from database tables.",
    options: [
      { id: "a", text: "INSERT", isCorrect: false },
      { id: "b", text: "SELECT", isCorrect: true },
      { id: "c", text: "UPDATE", isCorrect: false },
      { id: "d", text: "DELETE", isCorrect: false },
    ],
  },
  {
    id: "q5",
    question: "Which of the following is a relational database management system?",
    explanation:
      "MySQL is a popular Relational Database Management System (RDBMS).",
    options: [
      { id: "a", text: "HTML", isCorrect: false },
      { id: "b", text: "MySQL", isCorrect: true },
      { id: "c", text: "Python", isCorrect: false },
      { id: "d", text: "Linux", isCorrect: false },
    ],
  },
  {
    id: "q6",
    question: "Which operator is used for logical AND in C programming?",
    explanation:
      "The logical AND operator in C is written as &&.",
    options: [
      { id: "a", text: "&", isCorrect: false },
      { id: "b", text: "&&", isCorrect: true },
      { id: "c", text: "||", isCorrect: false },
      { id: "d", text: "!", isCorrect: false },
    ],
  },
  {
    id: "q7",
    question: "Which topology connects all devices to a central hub?",
    explanation:
      "Star topology connects all devices to a central hub or switch.",
    options: [
      { id: "a", text: "Bus", isCorrect: false },
      { id: "b", text: "Ring", isCorrect: false },
      { id: "c", text: "Star", isCorrect: true },
      { id: "d", text: "Mesh", isCorrect: false },
    ],
  },
  {
    id: "q8",
    question: "Which OOP concept allows one class to acquire properties of another?",
    explanation:
      "Inheritance allows a class to inherit properties and methods of another class.",
    options: [
      { id: "a", text: "Encapsulation", isCorrect: false },
      { id: "b", text: "Polymorphism", isCorrect: false },
      { id: "c", text: "Inheritance", isCorrect: true },
      { id: "d", text: "Abstraction", isCorrect: false },
    ],
  },
  {
    id: "q9",
    question: "Which Boolean law states A + 0 = A?",
    explanation:
      "The Identity Law states A + 0 = A.",
    options: [
      { id: "a", text: "Identity Law", isCorrect: true },
      { id: "b", text: "Complement Law", isCorrect: false },
      { id: "c", text: "De Morgan’s Law", isCorrect: false },
      { id: "d", text: "Associative Law", isCorrect: false },
    ],
  },
  {
    id: "q10",
    question: "Which function is used to open a file in C?",
    explanation:
      "The fopen() function is used to open a file in C programming.",
    options: [
      { id: "a", text: "open()", isCorrect: false },
      { id: "b", text: "fopen()", isCorrect: true },
      { id: "c", text: "fileopen()", isCorrect: false },
      { id: "d", text: "create()", isCorrect: false },
    ],
  },
  {
    id: "q11",
    question: "Which of the following is NOT an operating system?",
    explanation:
      "MS Word is an application software, not an operating system.",
    options: [
      { id: "a", text: "Windows", isCorrect: false },
      { id: "b", text: "Linux", isCorrect: false },
      { id: "c", text: "MS Word", isCorrect: true },
      { id: "d", text: "macOS", isCorrect: false },
    ],
  },
  {
    id: "q12",
    question: "Which data structure follows the FIFO principle?",
    explanation:
      "Queue follows First In First Out (FIFO) principle.",
    options: [
      { id: "a", text: "Stack", isCorrect: false },
      { id: "b", text: "Queue", isCorrect: true },
      { id: "c", text: "Tree", isCorrect: false },
      { id: "d", text: "Graph", isCorrect: false },
    ],
  },
];