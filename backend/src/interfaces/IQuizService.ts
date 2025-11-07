import { Quiz, QuizResponse, QuizResult } from '@quiz-app/shared';

export interface IQuizService {
  calculateResults(quiz: Quiz, response: QuizResponse): QuizResult;
  validateQuizResponse(quiz: Quiz, response: QuizResponse): { valid: boolean; errors: string[] };
}
