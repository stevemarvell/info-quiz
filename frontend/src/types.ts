export interface Metric {
  id: string;
  name: string;
  description: string;
}

export interface MetricScore {
  metricId: string;
  score: number;
}

export interface Answer {
  id: string;
  text: string;
  metricScores: MetricScore[];
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  metrics: Metric[];
  questions: Question[];
}

export interface QuizResponse {
  quizId: string;
  answers: {
    questionId: string;
    answerId: string;
  }[];
}

export interface QuizResult {
  quizId: string;
  metricScores: {
    metricId: string;
    metricName: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
  }[];
}
