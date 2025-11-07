import { ZodError, ZodSchema } from 'zod';
import {
  QuizSchema,
  QuizResponseSchema,
  CreateQuizSchema,
  UpdateQuizSchema,
  MetricSchema,
  QuestionSchema
} from './schemas';

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

  static validateQuiz(data: unknown): ValidationResult<any> {
    return this.validate(QuizSchema, data);
  }

  static validateCreateQuiz(data: unknown): ValidationResult<any> {
    return this.validate(CreateQuizSchema, data);
  }

  static validateUpdateQuiz(data: unknown): ValidationResult<any> {
    return this.validate(UpdateQuizSchema, data);
  }

  static validateQuizResponseSchema(data: unknown): ValidationResult<any> {
    return this.validate(QuizResponseSchema, data);
  }

  static validateMetric(data: unknown): ValidationResult<any> {
    return this.validate(MetricSchema, data);
  }

  static validateQuestion(data: unknown): ValidationResult<any> {
    return this.validate(QuestionSchema, data);
  }

  // Business logic validations
  static validateQuizConsistency(quiz: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that all metric IDs in answers are valid
    const metricIds = new Set(quiz.metrics.map((m: any) => m.id));

    for (const question of quiz.questions) {
      for (const answer of question.answers) {
        for (const metricScore of answer.metricScores) {
          if (!metricIds.has(metricScore.metricId)) {
            errors.push(
              `Answer "${answer.id}" references non-existent metric "${metricScore.metricId}"`
            );
          }
        }
      }
    }

    // Check for duplicate IDs
    const questionIds = quiz.questions.map((q: any) => q.id);
    const duplicateQuestions = questionIds.filter(
      (id: string, index: number) => questionIds.indexOf(id) !== index
    );
    if (duplicateQuestions.length > 0) {
      errors.push(`Duplicate question IDs found: ${duplicateQuestions.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateQuizResponseConsistency(quiz: any, response: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const questionIds = new Set(quiz.questions.map((q: any) => q.id));
    const questionAnswerMap = new Map<string, Set<string>>(
      quiz.questions.map((q: any) => [q.id, new Set(q.answers.map((a: any) => a.id))])
    );

    for (const answer of response.answers) {
      // Check if question exists
      if (!questionIds.has(answer.questionId)) {
        errors.push(`Invalid question ID: ${answer.questionId}`);
        continue;
      }

      // Check if answer belongs to question
      const validAnswers = questionAnswerMap.get(answer.questionId);
      if (validAnswers && !validAnswers.has(answer.answerId)) {
        errors.push(
          `Answer "${answer.answerId}" is not valid for question "${answer.questionId}"`
        );
      }
    }

    // Check if all questions are answered
    const answeredQuestions = new Set(response.answers.map((a: any) => a.questionId));
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
