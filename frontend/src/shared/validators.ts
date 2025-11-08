import { z, ZodError, ZodSchema } from 'zod';
import {
  AssessmentSchema,
  AssessmentSelectionSchema,
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  MetricSchema,
  QuestionSchema
} from './schemas';
import { Assessment, AssessmentSelection, Metric, Question } from './types';

// Infer types from schemas
export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details: ZodError;
  };
}

export class Validator {
  static validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const validated = schema.parse(data);
      return {
        success: true,
        data: validated
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: {
            message: 'Validation failed',
            details: error
          }
        };
      }
      throw error;
    }
  }

  static validateAssessment(data: unknown): ValidationResult<Assessment> {
    return this.validate(AssessmentSchema, data);
  }

  static validateCreateAssessment(data: unknown): ValidationResult<CreateAssessmentInput> {
    return this.validate(CreateAssessmentSchema, data);
  }

  static validateUpdateAssessment(data: unknown): ValidationResult<UpdateAssessmentInput> {
    return this.validate(UpdateAssessmentSchema, data);
  }

  static validateAssessmentSelectionSchema(data: unknown): ValidationResult<AssessmentSelection> {
    return this.validate(AssessmentSelectionSchema, data);
  }

  static validateMetric(data: unknown): ValidationResult<Metric> {
    return this.validate(MetricSchema, data);
  }

  static validateQuestion(data: unknown): ValidationResult<Question> {
    return this.validate(QuestionSchema, data);
  }

  // Business logic validations
  static validateAssessmentConsistency(assessment: Assessment): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that all metric IDs in options are valid
    const metricIds = new Set(assessment.metrics.map(m => m.id));

    for (const question of assessment.questions) {
      for (const option of question.options) {
        for (const metricScore of option.metricScores) {
          if (!metricIds.has(metricScore.metricId)) {
            errors.push(
              `Option "${option.id}" references non-existent metric "${metricScore.metricId}"`
            );
          }
        }
      }
    }

    // Check for duplicate question IDs
    const questionIds = assessment.questions.map(q => q.id);
    const duplicateQuestions = questionIds.filter(
      (id: string, index: number) => questionIds.indexOf(id) !== index
    );
    if (duplicateQuestions.length > 0) {
      errors.push(`Duplicate question IDs found: ${duplicateQuestions.join(', ')}`);
    }

    // Check for duplicate option IDs within each question
    for (const question of assessment.questions) {
      const optionIds = question.options.map(o => o.id);
      const duplicateOptions = optionIds.filter(
        (id: string, index: number) => optionIds.indexOf(id) !== index
      );
      if (duplicateOptions.length > 0) {
        errors.push(
          `Duplicate option IDs found in question '${question.text}': ${duplicateOptions.join(', ')}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateAssessmentSelectionConsistency(assessment: Assessment, selection: AssessmentSelection): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const questionIds = new Set(assessment.questions.map(q => q.id));
    const questionOptionMap = new Map<string, Set<string>>(
      assessment.questions.map(q => [q.id, new Set(q.options.map(o => o.id))])
    );

    for (const selectedOpt of selection.selectedOptions) {
      // Check if question exists
      if (!questionIds.has(selectedOpt.questionId)) {
        errors.push(`Invalid question ID: ${selectedOpt.questionId}`);
        continue;
      }

      // Check if option belongs to question
      const validOptions = questionOptionMap.get(selectedOpt.questionId);
      if (validOptions && !validOptions.has(selectedOpt.optionId)) {
        errors.push(
          `Option "${selectedOpt.optionId}" is not valid for question "${selectedOpt.questionId}"`
        );
      }
    }

    // Check if all questions are answered
    const answeredQuestions = new Set(selection.selectedOptions.map(s => s.questionId));
    for (const questionId of questionIds) {
      if (!answeredQuestions.has(questionId)) {
        errors.push(`Question "${questionId}" was not answered`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
