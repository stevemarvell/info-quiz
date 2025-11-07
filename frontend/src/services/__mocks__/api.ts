import { vi } from 'vitest';
import type { Quiz, QuizResponse, QuizResult } from '../../types';

export const api = {
  getAllQuizzes: vi.fn<[], Promise<Quiz[]>>(),
  getQuiz: vi.fn<[string], Promise<Quiz>>(),
  createQuiz: vi.fn<[Quiz], Promise<Quiz>>(),
  updateQuiz: vi.fn<[string, Quiz], Promise<Quiz>>(),
  deleteQuiz: vi.fn<[string], Promise<void>>(),
  submitQuiz: vi.fn<[string, QuizResponse], Promise<QuizResult>>(),
};
