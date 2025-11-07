import { http, HttpResponse } from 'msw';
import type { Quiz, QuizResult, ApiResponse } from '../types';

// Default mock data that can be overridden in tests
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Wellbeing Assessment',
    description: 'A comprehensive wellbeing quiz',
    metrics: [{ id: 'm1', name: 'Physical Health', description: '' }],
    questions: []
  },
  {
    id: 'quiz-2',
    title: 'Mental Health Check',
    description: 'Quick mental health assessment',
    metrics: [{ id: 'm2', name: 'Mental Health', description: '' }],
    questions: []
  }
];

export const mockQuiz: Quiz = {
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'A test quiz',
  metrics: [
    { id: 'm1', name: 'Metric 1', description: 'First metric' }
  ],
  questions: [
    {
      id: 'q1',
      text: 'Question 1?',
      answers: [
        { id: 'a1', text: 'Answer 1', metricScores: [{ metricId: 'm1', score: 1 }] },
        { id: 'a2', text: 'Answer 2', metricScores: [{ metricId: 'm1', score: 2 }] }
      ]
    },
    {
      id: 'q2',
      text: 'Question 2?',
      answers: [
        { id: 'a3', text: 'Answer 3', metricScores: [{ metricId: 'm1', score: 3 }] },
        { id: 'a4', text: 'Answer 4', metricScores: [{ metricId: 'm1', score: 4 }] }
      ]
    }
  ]
};

export const mockResult: QuizResult = {
  quizId: 'quiz-1',
  metricScores: [
    {
      metricId: 'm1',
      metricName: 'Metric 1',
      totalScore: 5,
      maxScore: 10,
      percentage: 50.0
    }
  ]
};

// MSW handlers - mock at network level (Chicago/classicist approach)
export const handlers = [
  http.get('/api/quizzes', () => {
    return HttpResponse.json<ApiResponse<Quiz[]>>({
      success: true,
      data: mockQuizzes
    });
  }),
  http.get('/api/quizzes/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json<ApiResponse<Quiz>>({
      success: true,
      data: { ...mockQuiz, id: id as string }
    });
  }),
  http.post('/api/quizzes/:id/responses', () => {
    return HttpResponse.json<ApiResponse<QuizResult>>({
      success: true,
      data: mockResult
    });
  }),
  http.post('/api/quizzes', async ({ request }) => {
    const quiz = await request.json() as Quiz;
    return HttpResponse.json<ApiResponse<Quiz>>({
      success: true,
      data: quiz
    }, { status: 201 });
  }),
  http.put('/api/quizzes/:id', async ({ request, params }) => {
    const quiz = await request.json() as Quiz;
    return HttpResponse.json<ApiResponse<Quiz>>({
      success: true,
      data: { ...quiz, id: params.id as string }
    });
  }),
  http.delete('/api/quizzes/:id', () => {
    return HttpResponse.json<ApiResponse<void>>({
      success: true,
      data: undefined
    });
  }),
];
