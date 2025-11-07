import { Quiz } from '@quiz-app/shared';
import { IQuizRepository } from './IQuizRepository';
import { logger } from '../utils/logger';

export class InMemoryQuizRepository implements IQuizRepository {
  private quizzes: Map<string, Quiz> = new Map();

  async findAll(): Promise<Quiz[]> {
    logger.debug('QuizRepository: Finding all quizzes');
    return Array.from(this.quizzes.values());
  }

  async findById(id: string): Promise<Quiz | null> {
    logger.debug(`QuizRepository: Finding quiz by id: ${id}`);
    return this.quizzes.get(id) || null;
  }

  async create(quiz: Quiz): Promise<Quiz> {
    logger.info(`QuizRepository: Creating quiz with id: ${quiz.id}`);

    if (this.quizzes.has(quiz.id)) {
      throw new Error(`Quiz with id ${quiz.id} already exists`);
    }

    this.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  async update(id: string, quiz: Quiz): Promise<Quiz | null> {
    logger.info(`QuizRepository: Updating quiz with id: ${id}`);

    if (!this.quizzes.has(id)) {
      logger.warn(`QuizRepository: Quiz not found for update: ${id}`);
      return null;
    }

    this.quizzes.set(id, { ...quiz, id }); // Ensure id doesn't change
    return this.quizzes.get(id) || null;
  }

  async delete(id: string): Promise<boolean> {
    logger.info(`QuizRepository: Deleting quiz with id: ${id}`);
    return this.quizzes.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.quizzes.has(id);
  }

  // Test helper methods
  clear(): void {
    this.quizzes.clear();
  }

  size(): number {
    return this.quizzes.size;
  }
}
