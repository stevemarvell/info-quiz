import request from 'supertest';
import express from 'express';
import { createRouter } from '../routes';
import { AssessmentService } from '../services/AssessmentService';
import { InMemoryAssessmentRepository } from '../repositories/InMemoryAssessmentRepository';
import { InMemoryAssessmentSelectionRepository } from '../repositories/InMemoryAssessmentSelectionRepository';
import { errorHandler } from '../middleware/errorHandler';
import { Assessment } from '../shared';

describe('Assessment API Routes', () => {
  let app: express.Application;
  let assessmentRepository: InMemoryAssessmentRepository;
  let selectionRepository: InMemoryAssessmentSelectionRepository;
  let assessmentService: AssessmentService;

  const sampleAssessment: Assessment = {
    id: 'test-assessment-1',
    title: 'Test Assessment',
    description: 'A test assessment',
    metrics: [
      { id: 'm1', name: 'Metric 1', description: 'Test metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Test question?',
        options: [
          {
            id: 'a1',
            text: 'Option 1',
            metricScores: [{ metricId: 'm1', score: 5 }]
          },
          {
            id: 'a2',
            text: 'Option 2',
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

    assessmentRepository = new InMemoryAssessmentRepository();
    selectionRepository = new InMemoryAssessmentSelectionRepository();
    assessmentService = new AssessmentService(assessmentRepository, selectionRepository);

    const router = createRouter(assessmentService);
    app.use('/api', router);
    app.use(errorHandler);
  });

  describe('GET /api/assessments', () => {
    it('should return empty array when no assessments exist', async () => {
      const response = await request(app)
        .get('/api/assessments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all assessments', async () => {
      await assessmentRepository.create(sampleAssessment);

      const response = await request(app)
        .get('/api/assessments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('test-assessment-1');
    });
  });

  describe('GET /api/assessments/:id', () => {
    it('should return a assessment by id', async () => {
      await assessmentRepository.create(sampleAssessment);

      const response = await request(app)
        .get('/api/assessments/test-assessment-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-assessment-1');
      expect(response.body.data.title).toBe('Test Assessment');
    });

    it('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .get('/api/assessments/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/assessments', () => {
    it('should create a new assessment', async () => {
      const response = await request(app)
        .post('/api/assessments')
        .send(sampleAssessment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-assessment-1');

      // Verify it was saved
      const saved = await assessmentRepository.findById('test-assessment-1');
      expect(saved).not.toBeNull();
      expect(saved?.title).toBe('Test Assessment');
    });

    it('should return 400 for invalid assessment data', async () => {
      const invalidAssessment = {
        id: 'test',
        title: '', // Invalid - empty title
        description: '',
        metrics: [],
        questions: []
      };

      const response = await request(app)
        .post('/api/assessments')
        .send(invalidAssessment)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ValidationError');
    });
  });

  describe('PUT /api/assessments/:id', () => {
    it('should update an existing assessment', async () => {
      await assessmentRepository.create(sampleAssessment);

      const updatedAssessment = {
        ...sampleAssessment,
        title: 'Updated Test Assessment'
      };

      const response = await request(app)
        .put('/api/assessments/test-assessment-1')
        .send(updatedAssessment)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Test Assessment');
    });

    it('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .put('/api/assessments/non-existent')
        .send(sampleAssessment)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/assessments/:id', () => {
    it('should delete a assessment', async () => {
      await assessmentRepository.create(sampleAssessment);

      await request(app)
        .delete('/api/assessments/test-assessment-1')
        .expect(204);

      // Verify it was deleted
      const deleted = await assessmentRepository.findById('test-assessment-1');
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent assessment', async () => {
      const response = await request(app)
        .delete('/api/assessments/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/assessments/:id/selections', () => {
    beforeEach(async () => {
      await assessmentRepository.create(sampleAssessment);
    });

    it('should submit a assessment selection and return results', async () => {
      const assessmentSelection = {
        assessmentId: 'test-assessment-1',
        selectedOptions: [
          { questionId: 'q1', optionId: 'a1' }
        ]
      };

      const response = await request(app)
        .post('/api/assessments/test-assessment-1/selections')
        .send(assessmentSelection)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assessmentId).toBe('test-assessment-1');
      expect(response.body.data.metricScores).toHaveLength(1);
      expect(response.body.data.metricScores[0].metricId).toBe('m1');
    });

    it('should return 400 for invalid selection', async () => {
      const invalidSelection = {
        assessmentId: 'test-assessment-1',
        selectedOptions: [
          { questionId: 'invalid', optionId: 'invalid' }
        ]
      };

      const response = await request(app)
        .post('/api/assessments/test-assessment-1/selections')
        .send(invalidSelection)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
