import { Quiz } from './shared';
import { IQuizStore } from './interfaces/IQuizStore';
import { logger } from './utils/logger';

export class InMemoryQuizStore implements IQuizStore {
  private quizzes: Map<string, Quiz> = new Map();

  async getAllQuizzes(): Promise<Quiz[]> {
    logger.debug('Fetching all quizzes');
    return Array.from(this.quizzes.values());
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    logger.debug(`Fetching quiz with id: ${id}`);
    return this.quizzes.get(id);
  }

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    logger.info(`Creating quiz with id: ${quiz.id}`);
    this.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  async updateQuiz(id: string, quiz: Quiz): Promise<Quiz | undefined> {
    if (!this.quizzes.has(id)) {
      logger.warn(`Quiz not found for update: ${id}`);
      return undefined;
    }
    logger.info(`Updating quiz with id: ${id}`);
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    logger.info(`Deleting quiz with id: ${id}`);
    return this.quizzes.delete(id);
  }

  // Test helper methods
  clear(): void {
    this.quizzes.clear();
  }

  size(): number {
    return this.quizzes.size;
  }
}

// Export singleton instance for backward compatibility
export const store = new InMemoryQuizStore();
