import { Quiz } from '@quiz-app/shared';

export interface IQuizStore {
  getAllQuizzes(): Promise<Quiz[]>;
  getQuiz(id: string): Promise<Quiz | undefined>;
  createQuiz(quiz: Quiz): Promise<Quiz>;
  updateQuiz(id: string, quiz: Quiz): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<boolean>;
}
