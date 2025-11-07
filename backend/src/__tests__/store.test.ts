import { InMemoryQuizStore } from '../store';
import { Quiz } from '../shared';

describe('InMemoryQuizStore', () => {
  let store: InMemoryQuizStore;

  const sampleQuiz: Quiz = {
    id: 'quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    metrics: [
      { id: 'm1', name: 'Metric 1', description: 'Test metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Question 1?',
        answers: [
          {
            id: 'a1',
            text: 'Answer 1',
            metricScores: [{ metricId: 'm1', score: 5 }]
          },
          {
            id: 'a2',
            text: 'Answer 2',
            metricScores: [{ metricId: 'm1', score: 3 }]
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    store = new InMemoryQuizStore();
  });

  describe('createQuiz', () => {
    it('should create a new quiz', async () => {
      const created = await store.createQuiz(sampleQuiz);
      expect(created).toEqual(sampleQuiz);
      expect(store.size()).toBe(1);
    });

    it('should store multiple quizzes', async () => {
      await store.createQuiz(sampleQuiz);
      await store.createQuiz({ ...sampleQuiz, id: 'quiz-2', title: 'Quiz 2' });
      expect(store.size()).toBe(2);
    });
  });

  describe('getQuiz', () => {
    it('should retrieve a quiz by id', async () => {
      await store.createQuiz(sampleQuiz);
      const retrieved = await store.getQuiz('quiz-1');
      expect(retrieved).toEqual(sampleQuiz);
    });

    it('should return undefined for non-existent quiz', async () => {
      const retrieved = await store.getQuiz('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllQuizzes', () => {
    it('should return empty array when no quizzes', async () => {
      const quizzes = await store.getAllQuizzes();
      expect(quizzes).toEqual([]);
    });

    it('should return all quizzes', async () => {
      await store.createQuiz(sampleQuiz);
      await store.createQuiz({ ...sampleQuiz, id: 'quiz-2', title: 'Quiz 2' });

      const quizzes = await store.getAllQuizzes();
      expect(quizzes).toHaveLength(2);
      expect(quizzes.map(q => q.id)).toContain('quiz-1');
      expect(quizzes.map(q => q.id)).toContain('quiz-2');
    });
  });

  describe('updateQuiz', () => {
    it('should update an existing quiz', async () => {
      await store.createQuiz(sampleQuiz);

      const updated = { ...sampleQuiz, title: 'Updated Title' };
      const result = await store.updateQuiz('quiz-1', updated);

      expect(result).toEqual(updated);
      const retrieved = await store.getQuiz('quiz-1');
      expect(retrieved?.title).toBe('Updated Title');
    });

    it('should return undefined for non-existent quiz', async () => {
      const result = await store.updateQuiz('non-existent', sampleQuiz);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteQuiz', () => {
    it('should delete an existing quiz', async () => {
      await store.createQuiz(sampleQuiz);
      expect(store.size()).toBe(1);

      const deleted = await store.deleteQuiz('quiz-1');
      expect(deleted).toBe(true);
      expect(store.size()).toBe(0);
    });

    it('should return false for non-existent quiz', async () => {
      const deleted = await store.deleteQuiz('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('test helper methods', () => {
    it('should clear all quizzes', async () => {
      await store.createQuiz(sampleQuiz);
      await store.createQuiz({ ...sampleQuiz, id: 'quiz-2' });
      expect(store.size()).toBe(2);

      store.clear();
      expect(store.size()).toBe(0);
    });

    it('should return correct size', async () => {
      expect(store.size()).toBe(0);
      await store.createQuiz(sampleQuiz);
      expect(store.size()).toBe(1);
      await store.createQuiz({ ...sampleQuiz, id: 'quiz-2' });
      expect(store.size()).toBe(2);
    });
  });
});
