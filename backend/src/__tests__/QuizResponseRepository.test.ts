import { AssessmentSelection, AssessmentResult } from '../shared';
import { InMemoryAssessmentSelectionRepository } from '../repositories/InMemoryAssessmentSelectionRepository';

describe('InMemoryAssessmentSelectionRepository', () => {
  let repository: InMemoryAssessmentSelectionRepository;

  const mockSelection: AssessmentSelection = {
    assessmentId: 'assessment-1',
    selectedOptions: [
      { questionId: 'q1', optionId: 'a1' },
      { questionId: 'q2', optionId: 'a2' }
    ]
  };

  const mockResult: AssessmentResult = {
    assessmentId: 'assessment-1',
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
    repository = new InMemoryAssessmentSelectionRepository();
  });

  describe('save', () => {
    it('should save a selection and result', async () => {
      await repository.save(mockSelection, mockResult);

      expect(repository.size()).toBe(1);
    });

    it('should increment selection ID counter', async () => {
      await repository.save(mockSelection, mockResult);
      await repository.save(mockSelection, mockResult);

      expect(repository.size()).toBe(2);
    });
  });

  describe('findByAssessmentId', () => {
    it('should find selections by assessment ID', async () => {
      await repository.save(mockSelection, mockResult);
      await repository.save(
        { ...mockSelection, assessmentId: 'assessment-2' },
        mockResult
      );

      const results = await repository.findByAssessmentId('assessment-1');

      expect(results).toHaveLength(1);
      expect(results[0].selection.assessmentId).toBe('assessment-1');
      expect(results[0].result).toEqual(mockResult);
    });

    it('should return empty array for non-existent assessment ID', async () => {
      await repository.save(mockSelection, mockResult);

      const results = await repository.findByAssessmentId('non-existent');

      expect(results).toHaveLength(0);
    });

    it('should return multiple selections for the same assessment', async () => {
      await repository.save(mockSelection, mockResult);
      await repository.save(mockSelection, mockResult);

      const results = await repository.findByAssessmentId('assessment-1');

      expect(results).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find selection by ID', async () => {
      await repository.save(mockSelection, mockResult);

      const result = await repository.findById('selection-1');

      expect(result).not.toBeNull();
      expect(result?.selection).toEqual(mockSelection);
      expect(result?.result).toEqual(mockResult);
    });

    it('should return null for non-existent ID', async () => {
      await repository.save(mockSelection, mockResult);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all selections', () => {
      repository.save(mockSelection, mockResult);
      repository.save(mockSelection, mockResult);

      expect(repository.size()).toBe(2);

      repository.clear();

      expect(repository.size()).toBe(0);
    });

    it('should reset ID counter', async () => {
      await repository.save(mockSelection, mockResult);
      repository.clear();
      await repository.save(mockSelection, mockResult);

      const result = await repository.findById('selection-1');

      expect(result).not.toBeNull();
    });
  });

  describe('size', () => {
    it('should return 0 for empty repository', () => {
      expect(repository.size()).toBe(0);
    });

    it('should return correct size', async () => {
      await repository.save(mockSelection, mockResult);
      expect(repository.size()).toBe(1);

      await repository.save(mockSelection, mockResult);
      expect(repository.size()).toBe(2);
    });
  });
});
