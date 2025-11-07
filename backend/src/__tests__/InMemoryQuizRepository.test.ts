import { InMemoryQuizRepository } from '../repositories/InMemoryQuizRepository';
import { Quiz } from '../shared';

describe('InMemoryQuizRepository', () => {
  let repository: InMemoryQuizRepository;

  const mockQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    metrics: [
      { id: 'metric-1', name: 'Metric 1', description: 'First metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Question 1?',
        answers: [
          {
            id: 'a1',
            text: 'Answer 1',
            metricScores: [{ metricId: 'metric-1', score: 5 }]
          },
          {
            id: 'a2',
            text: 'Answer 2',
            metricScores: [{ metricId: 'metric-1', score: 3 }]
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    repository = new InMemoryQuizRepository();
  });

  describe('create', () => {
    it('should create a new quiz', async () => {
      const result = await repository.create(mockQuiz);
      expect(result).toEqual(mockQuiz);
    });

    it('should throw error when creating quiz with duplicate id', async () => {
      await repository.create(mockQuiz);

      await expect(repository.create(mockQuiz)).rejects.toThrow(
        'Quiz already exists'
      );
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      await repository.create(mockQuiz);
      const quizzes = await repository.findAll();
      expect(quizzes).toHaveLength(1);
      expect(quizzes[0]).toEqual(mockQuiz);
    });

    it('should return empty array when no quizzes exist', async () => {
      const quizzes = await repository.findAll();
      expect(quizzes).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find quiz by id', async () => {
      await repository.create(mockQuiz);
      const result = await repository.findById('quiz-1');
      expect(result).toEqual(mockQuiz);
    });

    it('should return null when quiz not found', async () => {
      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing quiz', async () => {
      await repository.create(mockQuiz);
      const updated = { ...mockQuiz, title: 'Updated Title' };
      const result = await repository.update('quiz-1', updated);
      expect(result?.title).toBe('Updated Title');
    });

    it('should return null when updating nonexistent quiz', async () => {
      const result = await repository.update('nonexistent', mockQuiz);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing quiz', async () => {
      await repository.create(mockQuiz);
      const result = await repository.delete('quiz-1');
      expect(result).toBe(true);

      const found = await repository.findById('quiz-1');
      expect(found).toBeNull();
    });

    it('should return false when deleting nonexistent quiz', async () => {
      const result = await repository.delete('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when quiz exists', async () => {
      await repository.create(mockQuiz);
      const result = await repository.exists('quiz-1');
      expect(result).toBe(true);
    });

    it('should return false when quiz does not exist', async () => {
      const result = await repository.exists('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all quizzes', async () => {
      await repository.create(mockQuiz);
      repository.clear();

      const quizzes = await repository.findAll();
      expect(quizzes).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('should return correct size', async () => {
      expect(repository.size()).toBe(0);

      await repository.create(mockQuiz);
      expect(repository.size()).toBe(1);

      await repository.create({ ...mockQuiz, id: 'quiz-2' });
      expect(repository.size()).toBe(2);
    });
  });
});
