import { Quiz, QuizResponse, QuizResult } from '@quiz-app/shared';
import { Validator } from '@quiz-app/shared';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { IQuizResponseRepository } from '../repositories/IQuizResponseRepository';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SCORING } from '../config/constants';

export class QuizService {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly responseRepository: IQuizResponseRepository
  ) {}

  async getQuiz(id: string): Promise<Quiz | null> {
    return this.quizRepository.findById(id);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return this.quizRepository.findAll();
  }

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    // Validate quiz consistency
    const consistencyCheck = Validator.validateQuizConsistency(quiz);
    if (!consistencyCheck.valid) {
      throw new Error(`Quiz validation failed: ${consistencyCheck.errors.join(', ')}`);
    }

    return this.quizRepository.create(quiz);
  }

  async updateQuiz(id: string, quiz: Quiz): Promise<Quiz | null> {
    // Validate quiz consistency
    const consistencyCheck = Validator.validateQuizConsistency(quiz);
    if (!consistencyCheck.valid) {
      throw new Error(`Quiz validation failed: ${consistencyCheck.errors.join(', ')}`);
    }

    return this.quizRepository.update(id, quiz);
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizRepository.delete(id);
  }

  async submitQuizResponse(quizId: string, response: QuizResponse): Promise<QuizResult> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new AppError(404, 'Quiz not found');
    }

    // Validate response
    const responseValidation = this.validateQuizResponse(quiz, response);
    if (!responseValidation.valid) {
      throw new AppError(400, `Invalid quiz response: ${responseValidation.errors.join(', ')}`);
    }

    // Calculate results
    const result = this.calculateResults(quiz, response);

    // Save response and result
    await this.responseRepository.save(response, result);

    return result;
  }

  calculateResults(quiz: Quiz, response: QuizResponse): QuizResult {
    logger.info(`Calculating results for quiz: ${quiz.id}`);

    // Initialize metric totals
    const metricTotals = new Map<string, number>();
    quiz.metrics.forEach(metric => {
      metricTotals.set(metric.id, 0);
    });

    // Calculate actual maximum possible score per metric
    // For each question, find the highest score available for each metric
    const metricMaxScores = new Map<string, number>();
    quiz.metrics.forEach(metric => metricMaxScores.set(metric.id, 0));

    quiz.questions.forEach(question => {
      const questionMaxPerMetric = new Map<string, number>();

      // Find max score for each metric in this question's answers
      question.answers.forEach(answer => {
        answer.metricScores.forEach(ms => {
          const current = questionMaxPerMetric.get(ms.metricId) || 0;
          questionMaxPerMetric.set(ms.metricId, Math.max(current, ms.score));
        });
      });

      // Add this question's max to the total max for each metric
      questionMaxPerMetric.forEach((maxScore, metricId) => {
        const total = metricMaxScores.get(metricId) || 0;
        metricMaxScores.set(metricId, total + maxScore);
      });
    });

    // Calculate scores based on user's answers
    response.answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        const selectedAnswer = question.answers.find(a => a.id === answer.answerId);
        if (selectedAnswer) {
          selectedAnswer.metricScores.forEach(metricScore => {
            const currentTotal = metricTotals.get(metricScore.metricId) || 0;
            metricTotals.set(metricScore.metricId, currentTotal + metricScore.score);
          });
        }
      }
    });

    // Build result with dynamically calculated max scores
    const percentageMultiplier = Math.pow(10, SCORING.PERCENTAGE_DECIMAL_PLACES);
    const result: QuizResult = {
      quizId: quiz.id,
      metricScores: quiz.metrics.map(metric => {
        const totalScore = metricTotals.get(metric.id) || 0;
        const maxScore = metricMaxScores.get(metric.id) || 0;
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

        return {
          metricId: metric.id,
          metricName: metric.name,
          totalScore,
          maxScore,
          percentage: Math.round(percentage * percentageMultiplier) / percentageMultiplier
        };
      })
    };

    logger.debug('Quiz results calculated', { quizId: quiz.id, scores: result.metricScores });
    return result;
  }

  validateQuizResponse(quiz: Quiz, response: QuizResponse): { valid: boolean; errors: string[] } {
    return Validator.validateQuizResponseConsistency(quiz, response);
  }
}
