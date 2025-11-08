import { Assessment, AssessmentSelection, AssessmentResult } from '../shared';
import { Validator } from '../shared';
import { IAssessmentRepository } from '../repositories/IAssessmentRepository';
import { IAssessmentSelectionRepository } from '../repositories/IAssessmentSelectionRepository';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { SCORING } from '../config/constants';

export class AssessmentService {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly selectionRepository: IAssessmentSelectionRepository
  ) {}

  async getAssessment(id: string): Promise<Assessment | null> {
    return this.assessmentRepository.findById(id);
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return this.assessmentRepository.findAll();
  }

  async createAssessment(assessment: Assessment): Promise<Assessment> {
    // Validate assessment consistency
    const consistencyCheck = Validator.validateAssessmentConsistency(assessment);
    if (!consistencyCheck.valid) {
      throw new AppError(400, 'Assessment validation failed', { errors: consistencyCheck.errors });
    }

    return this.assessmentRepository.create(assessment);
  }

  async updateAssessment(id: string, assessment: Assessment): Promise<Assessment | null> {
    // Validate assessment consistency
    const consistencyCheck = Validator.validateAssessmentConsistency(assessment);
    if (!consistencyCheck.valid) {
      throw new AppError(400, 'Assessment validation failed', { errors: consistencyCheck.errors });
    }

    return this.assessmentRepository.update(id, assessment);
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.assessmentRepository.delete(id);
  }

  async submitAssessmentSelection(assessmentId: string, selection: AssessmentSelection): Promise<AssessmentResult> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AppError(404, 'Assessment not found');
    }

    // Validate selection
    const selectionValidation = this.validateAssessmentSelection(assessment, selection);
    if (!selectionValidation.valid) {
      throw new AppError(400, `Invalid assessment selection: ${selectionValidation.errors.join(', ')}`);
    }

    // Calculate results
    const result = this.calculateResults(assessment, selection);

    // Save selection and result
    await this.selectionRepository.save(selection, result);

    return result;
  }

  calculateResults(assessment: Assessment, selection: AssessmentSelection): AssessmentResult {
    logger.info(`Calculating results for assessment: ${assessment.id}`);

    // Initialize metric totals
    const metricTotals = new Map<string, number>();
    assessment.metrics.forEach(metric => {
      metricTotals.set(metric.id, 0);
    });

    // Calculate actual maximum possible score per metric
    // For each question, find the highest score available for each metric
    const metricMaxScores = new Map<string, number>();
    assessment.metrics.forEach(metric => metricMaxScores.set(metric.id, 0));

    assessment.questions.forEach(question => {
      const questionMaxPerMetric = new Map<string, number>();

      // Find max score for each metric in this question's options
      question.options.forEach(option => {
        option.metricScores.forEach(ms => {
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

    // Calculate scores based on user's selected options
    selection.selectedOptions.forEach(selectedOpt => {
      const question = assessment.questions.find(q => q.id === selectedOpt.questionId);
      if (!question) {
        logger.warn(`Question ${selectedOpt.questionId} not found in assessment ${assessment.id}`);
        return;
      }

      const selectedOption = question.options.find(o => o.id === selectedOpt.optionId);
      if (!selectedOption) {
        logger.warn(`Option ${selectedOpt.optionId} not found in question ${selectedOpt.questionId}`);
        return;
      }

      selectedOption.metricScores.forEach(metricScore => {
        const currentTotal = metricTotals.get(metricScore.metricId) || 0;
        metricTotals.set(metricScore.metricId, currentTotal + metricScore.score);
      });
    });

    // Build result with dynamically calculated max scores
    const percentageMultiplier = Math.pow(10, SCORING.PERCENTAGE_DECIMAL_PLACES);
    const result: AssessmentResult = {
      assessmentId: assessment.id,
      metricScores: assessment.metrics.map(metric => {
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

    logger.debug('Assessment results calculated', { assessmentId: assessment.id, scores: result.metricScores });
    return result;
  }

  validateAssessmentSelection(assessment: Assessment, selection: AssessmentSelection): { valid: boolean; errors: string[] } {
    return Validator.validateAssessmentSelectionConsistency(assessment, selection);
  }
}
