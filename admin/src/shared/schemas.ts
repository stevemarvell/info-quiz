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

// Option Schema (options within a question)
export const OptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(500),
  metricScores: z.array(MetricScoreSchema).min(1).max(50)
});

// Question Schema
export const QuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(1000),
  options: z.array(OptionSchema).min(2).max(10)
});

// Assessment Schema
export const AssessmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  metrics: z.array(MetricSchema).min(1).max(20),
  questions: z.array(QuestionSchema).min(1).max(100)
});

// Assessment Selection Schemas (user's submission)
export const SelectedOptionSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1)
});

export const AssessmentSelectionSchema = z.object({
  assessmentId: z.string().min(1),
  selectedOptions: z.array(SelectedOptionSchema).min(1)
});

// Assessment Result Schemas
export const MetricResultSchema = z.object({
  metricId: z.string(),
  metricName: z.string(),
  totalScore: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100)
});

export const AssessmentResultSchema = z.object({
  assessmentId: z.string(),
  metricScores: z.array(MetricResultSchema)
});

// Create Assessment Schema (for creation without ID)
export const CreateAssessmentSchema = AssessmentSchema.omit({ id: true });

// Update Assessment Schema (partial update)
export const UpdateAssessmentSchema = AssessmentSchema.partial().required({ id: true });
