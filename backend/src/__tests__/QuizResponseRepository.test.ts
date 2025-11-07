import { QuizResponse, QuizResult } from '../shared';
import { InMemoryQuizResponseRepository } from '../repositories/InMemoryQuizResponseRepository';

describe('InMemoryQuizResponseRepository', () => {
  let repository: InMemoryQuizResponseRepository;

  const mockResponse: QuizResponse = {
    quizId: 'quiz-1',
    answers: [
      { questionId: 'q1', answerId: 'a1' },
      { questionId: 'q2', answerId: 'a2' }
    ]
  };

  const mockResult: QuizResult = {
    quizId: 'quiz-1',
    metricScores: [
      {
        metricId: 'm1',
        metricName: 'Metric 1',
        totalScore: 8,
        maxScore: 10,
        percentage: 80
      }
    ]
  };

  beforeEach(() => {
    repository = new InMemoryQuizResponseRepository();
  });

  describe('save', () => {
    it('should save a response and result', async () => {
      await repository.save(mockResponse, mockResult);

      expect(repository.size()).toBe(1);
    });

    it('should increment response ID counter', async () => {
      await repository.save(mockResponse, mockResult);
      await repository.save(mockResponse, mockResult);

      expect(repository.size()).toBe(2);
    });
  });

  describe('findByQuizId', () => {
    it('should find responses by quiz ID', async () => {
      await repository.save(mockResponse, mockResult);
      await repository.save(
        { ...mockResponse, quizId: 'quiz-2' },
        mockResult
      );

      const results = await repository.findByQuizId('quiz-1');

      expect(results).toHaveLength(1);
      expect(results[0].response.quizId).toBe('quiz-1');
      expect(results[0].result).toEqual(mockResult);
    });

    it('should return empty array for non-existent quiz ID', async () => {
      await repository.save(mockResponse, mockResult);

      const results = await repository.findByQuizId('non-existent');

      expect(results).toHaveLength(0);
    });

    it('should return multiple responses for the same quiz', async () => {
      await repository.save(mockResponse, mockResult);
      await repository.save(mockResponse, mockResult);

      const results = await repository.findByQuizId('quiz-1');

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find response by ID', async () => {
      await repository.save(mockResponse, mockResult);

      const result = await repository.findById('response-1');

      expect(result).not.toBeNull();
      expect(result?.response).toEqual(mockResponse);
      expect(result?.result).toEqual(mockResult);
    });

    it('should return null for non-existent ID', async () => {
      await repository.save(mockResponse, mockResult);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all responses', () => {
      repository.save(mockResponse, mockResult);
      repository.save(mockResponse, mockResult);

      expect(repository.size()).toBe(2);

      repository.clear();

      expect(repository.size()).toBe(0);
    });

    it('should reset ID counter', async () => {
      await repository.save(mockResponse, mockResult);
      repository.clear();
      await repository.save(mockResponse, mockResult);

      const result = await repository.findById('response-1');

      expect(result).not.toBeNull();
    });
  });

  describe('size', () => {
    it('should return 0 for empty repository', () => {
      expect(repository.size()).toBe(0);
    });

    it('should return correct size', async () => {
      await repository.save(mockResponse, mockResult);
      expect(repository.size()).toBe(1);

      await repository.save(mockResponse, mockResult);
      expect(repository.size()).toBe(2);
    });
  });
});
