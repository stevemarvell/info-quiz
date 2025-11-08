import { Assessment } from '../shared';
import { IAssessmentRepository } from './IAssessmentRepository';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class InMemoryAssessmentRepository implements IAssessmentRepository {
  private assessments: Map<string, Assessment> = new Map();

  async findAll(): Promise<Assessment[]> {
    logger.debug('AssessmentRepository: Finding all assessments');
    return Array.from(this.assessments.values());
  }

  async findById(id: string): Promise<Assessment | null> {
    logger.debug(`AssessmentRepository: Finding assessment by id: ${id}`);
    return this.assessments.get(id) || null;
  }

  async create(assessment: Assessment): Promise<Assessment> {
    logger.info(`AssessmentRepository: Creating assessment with id: ${assessment.id}`);

    if (this.assessments.has(assessment.id)) {
      throw new AppError(409, 'Assessment already exists');
    }

    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  async update(id: string, assessment: Assessment): Promise<Assessment | null> {
    logger.info(`AssessmentRepository: Updating assessment with id: ${id}`);

    if (!this.assessments.has(id)) {
      logger.warn(`AssessmentRepository: Assessment not found for update: ${id}`);
      return null;
    }

    this.assessments.set(id, { ...assessment, id }); // Ensure id doesn't change
    return this.assessments.get(id) || null;
  }

  async delete(id: string): Promise<boolean> {
    logger.info(`AssessmentRepository: Deleting assessment with id: ${id}`);
    return this.assessments.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.assessments.has(id);
  }

  // Test helper methods
  clear(): void {
    this.assessments.clear();
  }

  size(): number {
    return this.assessments.size;
  }
}
