import { z } from 'zod';

// Metric Schemas
export const MetricSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500)
});

export const MetricScoreSchema = z.object({
  metricId: z.string().min(1),
  score: z.number().int().min(0).max(5)
});

// Answer Schema
export const AnswerSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(500),
  metricScores: z.array(MetricScoreSchema).min(1).max(50)
});

// Question Schema
export const QuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(1000),
  answers: z.array(AnswerSchema).min(2).max(10)
});

// Quiz Schema
export const QuizSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  metrics: z.array(MetricSchema).min(1).max(20),
  questions: z.array(QuestionSchema).min(1).max(100)
});

// Quiz Response Schemas
export const QuizAnswerSchema = z.object({
  questionId: z.string().min(1),
  answerId: z.string().min(1)
});

export const QuizResponseSchema = z.object({
  quizId: z.string().min(1),
  answers: z.array(QuizAnswerSchema).min(1)
});

// Quiz Result Schemas
export const MetricResultSchema = z.object({
  metricId: z.string(),
  metricName: z.string(),
  totalScore: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100)
});

export const QuizResultSchema = z.object({
  quizId: z.string(),
  metricScores: z.array(MetricResultSchema)
});

// Create Quiz Schema (for creation without ID)
export const CreateQuizSchema = QuizSchema.omit({ id: true });

// Update Quiz Schema (partial update)
export const UpdateQuizSchema = QuizSchema.partial().required({ id: true });
