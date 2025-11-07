import { QuizService } from '../services/QuizService';
import { InMemoryQuizRepository } from '../repositories/InMemoryQuizRepository';
import { InMemoryQuizResponseRepository } from '../repositories/InMemoryQuizResponseRepository';
import { Quiz, QuizResponse } from '@quiz-app/shared';

describe('QuizService', () => {
  let service: QuizService;
  let quizRepository: InMemoryQuizRepository;
  let responseRepository: InMemoryQuizResponseRepository;

  beforeEach(() => {
    quizRepository = new InMemoryQuizRepository();
    responseRepository = new InMemoryQuizResponseRepository();
    service = new QuizService(quizRepository, responseRepository);
  });

  describe('calculateResults', () => {
    it('should calculate scores correctly with varying answer scores', () => {
      // Quiz where answers have different scores for the same metric
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test',
        metrics: [
          { id: 'm1', name: 'Metric 1', description: 'Test metric 1' },
          { id: 'm2', name: 'Metric 2', description: 'Test metric 2' }
        ],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
              {
                id: 'q1a1',
                text: 'Answer 1',
                metricScores: [
                  { metricId: 'm1', score: 5 }, // Max for m1 in q1
                  { metricId: 'm2', score: 2 }
                ]
              },
              {
                id: 'q1a2',
                text: 'Answer 2',
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
            answers: [
              {
                id: 'q2a1',
                text: 'Answer 1',
                metricScores: [
                  { metricId: 'm1', score: 2 },
                  { metricId: 'm2', score: 5 } // Max for m2 in q2
                ]
              },
              {
                id: 'q2a2',
                text: 'Answer 2',
                metricScores: [
                  { metricId: 'm1', score: 4 }, // Max for m1 in q2
                  { metricId: 'm2', score: 1 }
                ]
              }
            ]
          }
        ]
      };

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'q1', answerId: 'q1a1' }, // m1: 5, m2: 2
          { questionId: 'q2', answerId: 'q2a2' }  // m1: 4, m2: 1
        ]
      };

      const result = service.calculateResults(quiz, response);

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
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
              {
                id: 'q1a1',
                text: 'Answer 1',
                metricScores: [{ metricId: 'm1', score: 0 }]
              },
              {
                id: 'q1a2',
                text: 'Answer 2',
                metricScores: [{ metricId: 'm1', score: 0 }]
              }
            ]
          }
        ]
      };

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [{ questionId: 'q1', answerId: 'q1a1' }]
      };

      const result = service.calculateResults(quiz, response);

      expect(result.metricScores[0].totalScore).toBe(0);
      expect(result.metricScores[0].maxScore).toBe(0);
      expect(result.metricScores[0].percentage).toBe(0);
    });

    it('should handle perfect score', () => {
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
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
            answers: [
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

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'q1', answerId: 'q1a1' },
          { questionId: 'q2', answerId: 'q2a1' }
        ]
      };

      const result = service.calculateResults(quiz, response);

      expect(result.metricScores[0].totalScore).toBe(10);
      expect(result.metricScores[0].maxScore).toBe(10);
      expect(result.metricScores[0].percentage).toBe(100);
    });

    it('should round percentages to 1 decimal place', () => {
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
              {
                id: 'q1a1',
                text: 'Answer 1',
                metricScores: [{ metricId: 'm1', score: 1 }]
              },
              {
                id: 'q1a2',
                text: 'Answer 2',
                metricScores: [{ metricId: 'm1', score: 3 }]
              }
            ]
          }
        ]
      };

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [{ questionId: 'q1', answerId: 'q1a1' }] // 1 out of 3
      };

      const result = service.calculateResults(quiz, response);

      // 1/3 * 100 = 33.333...
      expect(result.metricScores[0].percentage).toBe(33.3);
    });

    it('should handle multiple metrics independently', () => {
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
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
            answers: [
              {
                id: 'q1a1',
                text: 'Answer 1',
                metricScores: [
                  { metricId: 'm1', score: 5 },
                  { metricId: 'm2', score: 2 },
                  { metricId: 'm3', score: 0 }
                ]
              },
              {
                id: 'q1a2',
                text: 'Answer 2',
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

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [{ questionId: 'q1', answerId: 'q1a1' }]
      };

      const result = service.calculateResults(quiz, response);

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
      const quiz: Quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test',
        metrics: [{ id: 'm1', name: 'Metric 1', description: 'Test' }],
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            answers: [
              { id: 'q1a1', text: 'Answer 1', metricScores: [{ metricId: 'm1', score: 3 }] }, // Max for q1
              { id: 'q1a2', text: 'Answer 2', metricScores: [{ metricId: 'm1', score: 1 }] }
            ]
          },
          {
            id: 'q2',
            text: 'Question 2',
            answers: [
              { id: 'q2a1', text: 'Answer 1', metricScores: [{ metricId: 'm1', score: 5 }] }, // Max for q2
              { id: 'q2a2', text: 'Answer 2', metricScores: [{ metricId: 'm1', score: 2 }] }
            ]
          },
          {
            id: 'q3',
            text: 'Question 3',
            answers: [
              { id: 'q3a1', text: 'Answer 1', metricScores: [{ metricId: 'm1', score: 4 }] }, // Max for q3
              { id: 'q3a2', text: 'Answer 2', metricScores: [{ metricId: 'm1', score: 2 }] }
            ]
          }
        ]
      };

      const response: QuizResponse = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'q1', answerId: 'q1a2' }, // 1
          { questionId: 'q2', answerId: 'q2a2' }, // 2
          { questionId: 'q3', answerId: 'q3a2' }  // 2
        ]
      };

      const result = service.calculateResults(quiz, response);

      // Max: 3 + 5 + 4 = 12
      // User: 1 + 2 + 2 = 5
      // Percentage: 5/12 * 100 = 41.666... = 41.7
      expect(result.metricScores[0].totalScore).toBe(5);
      expect(result.metricScores[0].maxScore).toBe(12);
      expect(result.metricScores[0].percentage).toBe(41.7);
    });
  });
});
