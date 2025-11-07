import request from 'supertest';
import express from 'express';
import { createRouter } from '../routes';
import { QuizService } from '../services/QuizService';
import { InMemoryQuizRepository } from '../repositories/InMemoryQuizRepository';
import { InMemoryQuizResponseRepository } from '../repositories/InMemoryQuizResponseRepository';
import { errorHandler } from '../middleware/errorHandler';
import { Quiz } from '@quiz-app/shared';

describe('Quiz API Routes', () => {
  let app: express.Application;
  let quizRepository: InMemoryQuizRepository;
  let responseRepository: InMemoryQuizResponseRepository;
  let quizService: QuizService;

  const sampleQuiz: Quiz = {
    id: 'test-quiz-1',
    title: 'Test Quiz',
    description: 'A test quiz',
    metrics: [
      { id: 'm1', name: 'Metric 1', description: 'Test metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Test question?',
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
    // Setup app with dependencies
    app = express();
    app.use(express.json());

    quizRepository = new InMemoryQuizRepository();
    responseRepository = new InMemoryQuizResponseRepository();
    quizService = new QuizService(quizRepository, responseRepository);

    const router = createRouter(quizService);
    app.use('/api', router);
    app.use(errorHandler);
  });

  describe('GET /api/quizzes', () => {
    it('should return empty array when no quizzes exist', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all quizzes', async () => {
      await quizRepository.create(sampleQuiz);

      const response = await request(app)
        .get('/api/quizzes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('test-quiz-1');
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('should return a quiz by id', async () => {
      await quizRepository.create(sampleQuiz);

      const response = await request(app)
        .get('/api/quizzes/test-quiz-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-quiz-1');
      expect(response.body.data.title).toBe('Test Quiz');
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/quizzes/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .send(sampleQuiz)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-quiz-1');

      // Verify it was saved
      const saved = await quizRepository.findById('test-quiz-1');
      expect(saved).not.toBeNull();
      expect(saved?.title).toBe('Test Quiz');
    });

    it('should return 400 for invalid quiz data', async () => {
      const invalidQuiz = {
        id: 'test',
        title: '', // Invalid - empty title
        description: '',
        metrics: [],
        questions: []
      };

      const response = await request(app)
        .post('/api/quizzes')
        .send(invalidQuiz)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PUT /api/quizzes/:id', () => {
    it('should update an existing quiz', async () => {
      await quizRepository.create(sampleQuiz);

      const updatedQuiz = {
        ...sampleQuiz,
        title: 'Updated Test Quiz'
      };

      const response = await request(app)
        .put('/api/quizzes/test-quiz-1')
        .send(updatedQuiz)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Test Quiz');
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .put('/api/quizzes/non-existent')
        .send(sampleQuiz)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('should delete a quiz', async () => {
      await quizRepository.create(sampleQuiz);

      await request(app)
        .delete('/api/quizzes/test-quiz-1')
        .expect(204);

      // Verify it was deleted
      const deleted = await quizRepository.findById('test-quiz-1');
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .delete('/api/quizzes/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/quizzes/:id/responses', () => {
    beforeEach(async () => {
      await quizRepository.create(sampleQuiz);
    });

    it('should submit a quiz response and return results', async () => {
      const quizResponse = {
        quizId: 'test-quiz-1',
        answers: [
          { questionId: 'q1', answerId: 'a1' }
        ]
      };

      const response = await request(app)
        .post('/api/quizzes/test-quiz-1/responses')
        .send(quizResponse)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quizId).toBe('test-quiz-1');
      expect(response.body.data.metricScores).toHaveLength(1);
      expect(response.body.data.metricScores[0].metricId).toBe('m1');
    });

    it('should return 400 for invalid response', async () => {
      const invalidResponse = {
        quizId: 'test-quiz-1',
        answers: [
          { questionId: 'invalid', answerId: 'invalid' }
        ]
      };

      const response = await request(app)
        .post('/api/quizzes/test-quiz-1/responses')
        .send(invalidResponse)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
