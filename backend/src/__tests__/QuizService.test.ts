import { AssessmentService } from '../services/AssessmentService';
import { InMemoryAssessmentRepository } from '../repositories/InMemoryAssessmentRepository';
import { InMemoryAssessmentSelectionRepository } from '../repositories/InMemoryAssessmentSelectionRepository';
import { Assessment, AssessmentSelection } from '../shared';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let assessmentRepository: InMemoryAssessmentRepository;
  let selectionRepository: InMemoryAssessmentSelectionRepository;

  beforeEach(() => {
    assessmentRepository = new InMemoryAssessmentRepository();
    selectionRepository = new InMemoryAssessmentSelectionRepository();
    service = new AssessmentService(assessmentRepository, selectionRepository);
  });

  describe('calculateResults', () => {
    it('should calculate scores correctly with varying answer scores', () => {
      // Assessment where selectedOptions have different scores for the same metric
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [
          { id: 'm1', name: 'Metric 1', description: 'Test metric 1' },
          { id: 'm2', name: 'Metric 2', description: 'Test metric 2' }
        ],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'q1a1',
                text: 'Option 1',
                metricScores: [
                  { metricId: 'm1', score: 5 }, // Max for m1 in q1
                  { metricId: 'm2', score: 2 }
                ]
              },
              {
                id: 'q1a2',
                text: 'Option 2',
                metricScores: [
                  { metricId: 'm1', score: 3 },
                  { metricId: 'm2', score: 4 } // Max for m2 in q1
                ]
              }
            ]
          },
          {
            id: 'q2',
            text: 'Question 2',
            options: [
              {
                id: 'q2a1',
                text: 'Option 1',
                metricScores: [
                  { metricId: 'm1', score: 2 },
                  { metricId: 'm2', score: 5 } // Max for m2 in q2
                ]
              },
              {
                id: 'q2a2',
                text: 'Option 2',
                metricScores: [
                  { metricId: 'm1', score: 4 }, // Max for m1 in q2
                  { metricId: 'm2', score: 1 }
                ]
              }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [
          { questionId: 'q1', optionId: 'q1a1' }, // m1: 5, m2: 2
          { questionId: 'q2', optionId: 'q2a2' }  // m1: 4, m2: 1
        ]
      };

      const result = service.calculateResults(assessment, selection);

      // Max scores: m1 = 5+4 = 9, m2 = 4+5 = 9
      // User scores: m1 = 5+4 = 9, m2 = 2+1 = 3

      const m1Result = result.metricScores.find((ms: any) => ms.metricId === 'm1');
      const m2Result = result.metricScores.find((ms: any) => ms.metricId === 'm2');

      expect(m1Result).toBeDefined();
      expect(m1Result!.totalScore).toBe(9);
      expect(m1Result!.maxScore).toBe(9);
      expect(m1Result!.percentage).toBe(100);

      expect(m2Result).toBeDefined();
      expect(m2Result!.totalScore).toBe(3);
      expect(m2Result!.maxScore).toBe(9);
      expect(m2Result!.percentage).toBe(33.3);
    });

    it('should handle all zero scores', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'q1a1',
                text: 'Option 1',
                metricScores: [{ metricId: 'm1', score: 0 }]
              },
              {
                id: 'q1a2',
                text: 'Option 2',
                metricScores: [{ metricId: 'm1', score: 0 }]
              }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [{ questionId: 'q1', optionId: 'q1a1' }]
      };

      const result = service.calculateResults(assessment, selection);

      expect(result.metricScores[0].totalScore).toBe(0);
      expect(result.metricScores[0].maxScore).toBe(0);
      expect(result.metricScores[0].percentage).toBe(0);
    });

    it('should handle perfect score', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'q1a1',
                text: 'Perfect answer',
                metricScores: [{ metricId: 'm1', score: 5 }]
              },
              {
                id: 'q1a2',
                text: 'Lower answer',
                metricScores: [{ metricId: 'm1', score: 2 }]
              }
            ]
          },
          {
            id: 'q2',
            text: 'Question 2',
            options: [
              {
                id: 'q2a1',
                text: 'Perfect answer',
                metricScores: [{ metricId: 'm1', score: 5 }]
              },
              {
                id: 'q2a2',
                text: 'Lower answer',
                metricScores: [{ metricId: 'm1', score: 3 }]
              }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [
          { questionId: 'q1', optionId: 'q1a1' },
          { questionId: 'q2', optionId: 'q2a1' }
        ]
      };

      const result = service.calculateResults(assessment, selection);

      expect(result.metricScores[0].totalScore).toBe(10);
      expect(result.metricScores[0].maxScore).toBe(10);
      expect(result.metricScores[0].percentage).toBe(100);
    });

    it('should round percentages to 1 decimal place', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'q1a1',
                text: 'Option 1',
                metricScores: [{ metricId: 'm1', score: 1 }]
              },
              {
                id: 'q1a2',
                text: 'Option 2',
                metricScores: [{ metricId: 'm1', score: 3 }]
              }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [{ questionId: 'q1', optionId: 'q1a1' }] // 1 out of 3
      };

      const result = service.calculateResults(assessment, selection);

      // 1/3 * 100 = 33.333...
      expect(result.metricScores[0].percentage).toBe(33.3);
    });

    it('should handle multiple metrics independently', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [
          { id: 'm1', name: 'Metric 1', description: 'Test' },
          { id: 'm2', name: 'Metric 2', description: 'Test' },
          { id: 'm3', name: 'Metric 3', description: 'Test' }
        ],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'q1a1',
                text: 'Option 1',
                metricScores: [
                  { metricId: 'm1', score: 5 },
                  { metricId: 'm2', score: 2 },
                  { metricId: 'm3', score: 0 }
                ]
              },
              {
                id: 'q1a2',
                text: 'Option 2',
                metricScores: [
                  { metricId: 'm1', score: 1 },
                  { metricId: 'm2', score: 4 },
                  { metricId: 'm3', score: 5 }
                ]
              }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [{ questionId: 'q1', optionId: 'q1a1' }]
      };

      const result = service.calculateResults(assessment, selection);

      // m1: 5/5 = 100%, m2: 2/4 = 50%, m3: 0/5 = 0%
      const m1 = result.metricScores.find((ms: any) => ms.metricId === 'm1');
      const m2 = result.metricScores.find((ms: any) => ms.metricId === 'm2');
      const m3 = result.metricScores.find((ms: any) => ms.metricId === 'm3');

      expect(m1!.totalScore).toBe(5);
      expect(m1!.maxScore).toBe(5);
      expect(m1!.percentage).toBe(100);

      expect(m2!.totalScore).toBe(2);
      expect(m2!.maxScore).toBe(4);
      expect(m2!.percentage).toBe(50);

      expect(m3!.totalScore).toBe(0);
      expect(m3!.maxScore).toBe(5);
      expect(m3!.percentage).toBe(0);
    });

    it('should calculate correct max when different questions have different max scores', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              { id: 'q1a1', text: 'Option 1', metricScores: [{ metricId: 'm1', score: 3 }] }, // Max for q1
              { id: 'q1a2', text: 'Option 2', metricScores: [{ metricId: 'm1', score: 1 }] }
            ]
          },
          {
            id: 'q2',
            text: 'Question 2',
            options: [
              { id: 'q2a1', text: 'Option 1', metricScores: [{ metricId: 'm1', score: 5 }] }, // Max for q2
              { id: 'q2a2', text: 'Option 2', metricScores: [{ metricId: 'm1', score: 2 }] }
            ]
          },
          {
            id: 'q3',
            text: 'Question 3',
            options: [
              { id: 'q3a1', text: 'Option 1', metricScores: [{ metricId: 'm1', score: 4 }] }, // Max for q3
              { id: 'q3a2', text: 'Option 2', metricScores: [{ metricId: 'm1', score: 2 }] }
            ]
          }
        ]
      };

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [
          { questionId: 'q1', optionId: 'q1a2' }, // 1
          { questionId: 'q2', optionId: 'q2a2' }, // 2
          { questionId: 'q3', optionId: 'q3a2' }  // 2
        ]
      };

      const result = service.calculateResults(assessment, selection);

      // Max: 3 + 5 + 4 = 12
      // User: 1 + 2 + 2 = 5
      // Percentage: 5/12 * 100 = 41.666... = 41.7
      expect(result.metricScores[0].totalScore).toBe(5);
      expect(result.metricScores[0].maxScore).toBe(12);
      expect(result.metricScores[0].percentage).toBe(41.7);
    });
  });

  describe('createAssessment', () => {
    it('should throw error when assessment has invalid metric references', async () => {
      const invalidAssessment: Assessment = {
        id: 'invalid-assessment',
        title: 'Invalid Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'a1',
                text: 'Option 1',
                metricScores: [{ metricId: 'invalid-metric', score: 5 }]
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

      await expect(service.createAssessment(invalidAssessment)).rejects.toThrow('Assessment validation failed');
    });
  });

  describe('updateAssessment', () => {
    it('should throw error when assessment has invalid consistency', async () => {
      const invalidAssessment: Assessment = {
        id: 'invalid-assessment',
        title: 'Invalid Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            options: [
              {
                id: 'a1',
                text: 'Option 1',
                metricScores: [{ metricId: 'wrong-metric', score: 5 }]
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

      await expect(service.updateAssessment('test-id', invalidAssessment)).rejects.toThrow(
        'Assessment validation failed'
      );
    });
  });

  describe('submitAssessmentSelection', () => {
    const validAssessment: Assessment = {
      id: 'test-assessment',
      title: 'Test Assessment',
      description: 'Test',
      metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
      questions: [
        {
          id: 'q1',
          text: 'Question 1',
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

    beforeEach(async () => {
      await assessmentRepository.create(validAssessment);
    });

    it('should throw error when assessment not found', async () => {
      const selection: AssessmentSelection = {
        assessmentId: 'nonexistent-assessment',
        selectedOptions: [{ questionId: 'q1', optionId: 'a1' }]
      };

      await expect(service.submitAssessmentSelection('nonexistent-assessment', selection)).rejects.toThrow(
        'Assessment not found'
      );
    });

    it('should throw error when selection has invalid question id', async () => {
      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [{ questionId: 'invalid-q', optionId: 'a1' }]
      };

      await expect(service.submitAssessmentSelection('test-assessment', selection)).rejects.toThrow(
        'Invalid assessment selection'
      );
    });
  });

  describe('calculateResults with invalid data', () => {
    it('should handle invalid question id in selection', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
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

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [
          { questionId: 'q1', optionId: 'a1' },
          { questionId: 'invalid-question', optionId: 'a1' } // Invalid question
        ]
      };

      const result = service.calculateResults(assessment, selection);

      // Should still calculate correctly, ignoring invalid question
      expect(result.metricScores[0].totalScore).toBe(5);
    });

    it('should handle invalid answer id in selection', () => {
      const assessment: Assessment = {
        id: 'test-assessment',
        title: 'Test Assessment',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
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

      const selection: AssessmentSelection = {
        assessmentId: 'test-assessment',
        selectedOptions: [{ questionId: 'q1', optionId: 'invalid-answer' }] // Invalid answer
      };

      const result = service.calculateResults(assessment, selection);

      // Should still calculate correctly, ignoring invalid answer
      expect(result.metricScores[0].totalScore).toBe(0);
    });
  });
});
