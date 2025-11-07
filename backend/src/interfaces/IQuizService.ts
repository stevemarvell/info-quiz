import { Quiz, QuizResponse, QuizResult } from '../shared';

export interface IQuizService {
  calculateResults(quiz: Quiz, response: QuizResponse): QuizResult;
  validateQuizResponse(quiz: Quiz, response: QuizResponse): { valid: boolean; errors: string[] };
}
