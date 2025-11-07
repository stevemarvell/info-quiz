import { Validator } from '../validators';
import { Quiz, QuizResponse } from '../types';

describe('Validator', () => {
  describe('validateQuiz', () => {
    const validQuiz = {
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

    it('should validate a valid quiz', () => {
      const result = Validator.validateQuiz(validQuiz);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validQuiz);
    });

    it('should reject quiz with empty title', () => {
      const invalidQuiz = { ...validQuiz, title: '' };
      const result = Validator.validateQuiz(invalidQuiz);
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Validation failed');
    });

    it('should reject quiz with no metrics', () => {
      const invalidQuiz = { ...validQuiz, metrics: [] };
      const result = Validator.validateQuiz(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject quiz with invalid score', () => {
      const invalidQuiz = {
        ...validQuiz,
        questions: [
          {
            ...validQuiz.questions[0],
            answers: [
              {
                id: 'a1',
                text: 'Answer 1',
                metricScores: [{ metricId: 'metric-1', score: 6 }] // Invalid score
              }
            ]
          }
        ]
      };
      const result = Validator.validateQuiz(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('should reject quiz with less than 2 answers per question', () => {
      const invalidQuiz = {
        ...validQuiz,
        questions: [
          {
            id: 'q1',
            text: 'Question 1?',
            answers: [
              {
                id: 'a1',
                text: 'Answer 1',
                metricScores: [{ metricId: 'metric-1', score: 5 }]
              }
            ]
          }
        ]
      };
      const result = Validator.validateQuiz(invalidQuiz);
      expect(result.success).toBe(false);
    });
  });

  describe('validateQuizConsistency', () => {
    it('should validate quiz with consistent metric references', () => {
      const quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test Description',
        metrics: [{ id: 'm1', name: 'Metric 1', description: '' }],
        questions: [
          {
            id: 'q1',
            text: 'Question?',
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

      const result = Validator.validateQuizConsistency(quiz);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject quiz with invalid metric reference', () => {
      const quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test Description',
        metrics: [{ id: 'm1', name: 'Metric 1', description: '' }],
        questions: [
          {
            id: 'q1',
            text: 'Question?',
            answers: [
              {
                id: 'a1',
                text: 'Answer 1',
                metricScores: [{ metricId: 'invalid-metric', score: 5 }]
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

      const result = Validator.validateQuizConsistency(quiz);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('invalid-metric');
    });

    it('should reject quiz with duplicate question IDs', () => {
      const quiz = {
        id: 'test-quiz',
        title: 'Test Quiz',
        description: 'Test Description',
        metrics: [{ id: 'm1', name: 'Metric 1', description: '' }],
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
          },
          {
            id: 'q1', // Duplicate ID
            text: 'Question 2?',
            answers: [
              {
                id: 'a3',
                text: 'Answer 3',
                metricScores: [{ metricId: 'm1', score: 4 }]
              },
              {
                id: 'a4',
                text: 'Answer 4',
                metricScores: [{ metricId: 'm1', score: 2 }]
              }
            ]
          }
        ]
      };

      const result = Validator.validateQuizConsistency(quiz);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Duplicate question IDs');
    });
  });

  describe('validateQuizResponse', () => {
    const quiz = {
      id: 'test-quiz',
      title: 'Test Quiz',
      description: 'Test Description',
      metrics: [{ id: 'm1', name: 'Metric 1', description: '' }],
      questions: [
        {
          id: 'q1',
          text: 'Question 1?',
          answers: [
            { id: 'a1', text: 'Answer 1', metricScores: [] },
            { id: 'a2', text: 'Answer 2', metricScores: [] }
          ]
        },
        {
          id: 'q2',
          text: 'Question 2?',
          answers: [
            { id: 'a3', text: 'Answer 3', metricScores: [] },
            { id: 'a4', text: 'Answer 4', metricScores: [] }
          ]
        }
      ]
    };

    it('should validate a valid response', () => {
      const response = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'q1', answerId: 'a1' },
          { questionId: 'q2', answerId: 'a3' }
        ]
      };

      const result = Validator.validateQuizResponseConsistency(quiz, response);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject response with invalid question ID', () => {
      const response = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'invalid-q', answerId: 'a1' },
          { questionId: 'q2', answerId: 'a3' }
        ]
      };

      const result = Validator.validateQuizResponseConsistency(quiz, response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid question ID');
    });

    it('should reject response with invalid answer ID', () => {
      const response = {
        quizId: 'test-quiz',
        answers: [
          { questionId: 'q1', answerId: 'invalid-a' },
          { questionId: 'q2', answerId: 'a3' }
        ]
      };

      const result = Validator.validateQuizResponseConsistency(quiz, response);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('not valid for question');
    });

    it('should reject response with missing questions', () => {
      const response = {
        quizId: 'test-quiz',
        answers: [{ questionId: 'q1', answerId: 'a1' }]
      };

      const result = Validator.validateQuizResponseConsistency(quiz, response);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: string) => e.includes('was not answered'))).toBe(true);
    });
  });
});
