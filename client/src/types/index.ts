export interface Topic {
  name: string;
  duration: number;
  isBreak: boolean;
}

export interface StudyPlan {
  id: string;
  subject: string;
  topics: Topic[];
  examDate: string;
}

export interface Note {
  id: string;
  topic: string;
  detailLevel: string;
  format: string;
  content: string;
  createdAt: string;
}

export interface Explanation {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  score?: number;
  createdAt: string;
}

export interface Progress {
  topic: string;
  quizScores: number[];
  completion: number;
  lastStudied: string;
}
