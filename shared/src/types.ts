import { z } from 'zod';
import {
  MetricSchema,
  MetricScoreSchema,
  AnswerSchema,
  QuestionSchema,
  QuizSchema,
  QuizAnswerSchema,
  QuizResponseSchema,
  MetricResultSchema,
  QuizResultSchema,
  CreateQuizSchema,
  UpdateQuizSchema
} from './schemas';

// Infer TypeScript types from Zod schemas
export type Metric = z.infer<typeof MetricSchema>;
export type MetricScore = z.infer<typeof MetricScoreSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type QuizResponse = z.infer<typeof QuizResponseSchema>;
export type MetricResult = z.infer<typeof MetricResultSchema>;
export type QuizResult = z.infer<typeof QuizResultSchema>;
export type CreateQuiz = z.infer<typeof CreateQuizSchema>;
export type UpdateQuiz = z.infer<typeof UpdateQuizSchema>;

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: true;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  success: false;
  details?: unknown;
}
