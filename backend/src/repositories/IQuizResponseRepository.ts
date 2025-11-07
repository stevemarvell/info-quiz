import { QuizResponse, QuizResult } from '../shared';

export interface IQuizResponseRepository {
  save(response: QuizResponse, result: QuizResult): Promise<void>;
  findByQuizId(quizId: string): Promise<Array<{ response: QuizResponse; result: QuizResult }>>;
  findById(responseId: string): Promise<{ response: QuizResponse; result: QuizResult } | null>;
}
