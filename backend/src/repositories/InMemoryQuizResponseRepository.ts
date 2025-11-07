import { QuizResponse, QuizResult } from '@quiz-app/shared';
import { IQuizResponseRepository } from './IQuizResponseRepository';
import { logger } from '../utils/logger';

interface StoredResponse {
  id: string;
  response: QuizResponse;
  result: QuizResult;
  timestamp: Date;
}

export class InMemoryQuizResponseRepository implements IQuizResponseRepository {
  private responses: Map<string, StoredResponse> = new Map();
  private responseIdCounter = 1;

  async save(response: QuizResponse, result: QuizResult): Promise<void> {
    const id = `response-${this.responseIdCounter++}`;
    logger.info(`QuizResponseRepository: Saving response with id: ${id}`);

    const stored: StoredResponse = {
      id,
      response,
      result,
      timestamp: new Date()
    };

    this.responses.set(id, stored);
  }

  async findByQuizId(quizId: string): Promise<Array<{ response: QuizResponse; result: QuizResult }>> {
    logger.debug(`QuizResponseRepository: Finding responses for quiz: ${quizId}`);

    const responses = Array.from(this.responses.values())
      .filter(r => r.response.quizId === quizId)
      .map(r => ({ response: r.response, result: r.result }));

    return responses;
  }

  async findById(responseId: string): Promise<{ response: QuizResponse; result: QuizResult } | null> {
    logger.debug(`QuizResponseRepository: Finding response by id: ${responseId}`);

    const stored = this.responses.get(responseId);
    if (!stored) {
      return null;
    }

    return {
      response: stored.response,
      result: stored.result
    };
  }

  // Test helper methods
  clear(): void {
    this.responses.clear();
    this.responseIdCounter = 1;
  }

  size(): number {
    return this.responses.size;
  }
}
