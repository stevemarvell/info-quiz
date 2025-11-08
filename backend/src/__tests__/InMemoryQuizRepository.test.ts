import { InMemoryAssessmentRepository } from '../repositories/InMemoryAssessmentRepository';
import { Assessment } from '../shared';

describe('InMemoryAssessmentRepository', () => {
  let repository: InMemoryAssessmentRepository;

  const mockAssessment: Assessment = {
    id: 'assessment-1',
    title: 'Test Assessment',
    description: 'A test assessment',
    metrics: [
      { id: 'metric-1', name: 'Metric 1', description: 'First metric' }
    ],
    questions: [
      {
        id: 'q1',
        text: 'Question 1?',
        options: [
          {
            id: 'a1',
            text: 'Option 1',
            metricScores: [{ metricId: 'metric-1', score: 5 }]
          },
          {
            id: 'a2',
            text: 'Option 2',
            metricScores: [{ metricId: 'metric-1', score: 3 }]
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    repository = new InMemoryAssessmentRepository();
  });

  describe('create', () => {
    it('should create a new assessment', async () => {
      const result = await repository.create(mockAssessment);
      expect(result).toEqual(mockAssessment);
    });

    it('should throw error when creating assessment with duplicate id', async () => {
      await repository.create(mockAssessment);

      await expect(repository.create(mockAssessment)).rejects.toThrow(
        'Assessment already exists'
      );
    });
  });

  describe('findAll', () => {
    it('should return all assessmentzes', async () => {
      await repository.create(mockAssessment);
      const assessmentzes = await repository.findAll();
      expect(assessmentzes).toHaveLength(1);
      expect(assessmentzes[0]).toEqual(mockAssessment);
    });

    it('should return empty array when no assessmentzes exist', async () => {
      const assessmentzes = await repository.findAll();
      expect(assessmentzes).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find assessment by id', async () => {
      await repository.create(mockAssessment);
      const result = await repository.findById('assessment-1');
      expect(result).toEqual(mockAssessment);
    });

    it('should return null when assessment not found', async () => {
      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing assessment', async () => {
      await repository.create(mockAssessment);
      const updated = { ...mockAssessment, title: 'Updated Title' };
      const result = await repository.update('assessment-1', updated);
      expect(result?.title).toBe('Updated Title');
    });

    it('should return null when updating nonexistent assessment', async () => {
      const result = await repository.update('nonexistent', mockAssessment);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing assessment', async () => {
      await repository.create(mockAssessment);
      const result = await repository.delete('assessment-1');
      expect(result).toBe(true);

      const found = await repository.findById('assessment-1');
      expect(found).toBeNull();
    });

    it('should return false when deleting nonexistent assessment', async () => {
      const result = await repository.delete('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when assessment exists', async () => {
      await repository.create(mockAssessment);
      const result = await repository.exists('assessment-1');
      expect(result).toBe(true);
    });

    it('should return false when assessment does not exist', async () => {
      const result = await repository.exists('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all assessmentzes', async () => {
      await repository.create(mockAssessment);
      repository.clear();

      const assessmentzes = await repository.findAll();
      expect(assessmentzes).toHaveLength(0);
    });
  });

  describe('size', () => {
    it('should return correct size', async () => {
      expect(repository.size()).toBe(0);

      await repository.create(mockAssessment);
      expect(repository.size()).toBe(1);

      await repository.create({ ...mockAssessment, id: 'assessment-2' });
      expect(repository.size()).toBe(2);
    });
  });
});
