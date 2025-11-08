import { z } from 'zod';
import {
  MetricSchema,
  MetricScoreSchema,
  OptionSchema,
  QuestionSchema,
  AssessmentSchema,
  SelectedOptionSchema,
  AssessmentSelectionSchema,
  MetricResultSchema,
  AssessmentResultSchema,
  CreateAssessmentSchema,
  UpdateAssessmentSchema
} from './schemas';

// Infer TypeScript types from Zod schemas
export type Metric = z.infer<typeof MetricSchema>;
export type MetricScore = z.infer<typeof MetricScoreSchema>;
export type Option = z.infer<typeof OptionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Assessment = z.infer<typeof AssessmentSchema>;
export type SelectedOption = z.infer<typeof SelectedOptionSchema>;
export type AssessmentSelection = z.infer<typeof AssessmentSelectionSchema>;
export type MetricResult = z.infer<typeof MetricResultSchema>;
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
export type CreateAssessment = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessment = z.infer<typeof UpdateAssessmentSchema>;

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
