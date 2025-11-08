import { http, HttpResponse } from 'msw';
import type { Assessment, AssessmentResult, ApiResponse } from '../shared/types';

// Default mock data that can be overridden in tests
export const mockAssessments: Assessment[] = [
  {
    id: 'assessment-1',
    title: 'Wellbeing Assessment',
    description: 'A comprehensive wellbeing assessment',
    metrics: [{ id: 'm1', name: 'Physical Health', description: '' }],
    questions: []
  },
  {
    id: 'assessment-2',
    title: 'Mental Health Check',
    description: 'Quick mental health assessment',
    metrics: [{ id: 'm2', name: 'Mental Health', description: '' }],
    questions: []
  }
];

export const mockAssessment: Assessment = {
  id: 'assessment-1',
  title: 'Test Assessment',
  description: 'A test assessment',
  metrics: [
    { id: 'm1', name: 'Metric 1', description: 'First metric' }
  ],
  questions: [
    {
      id: 'q1',
      text: 'Question 1?',
      options: [
        { id: 'o1', text: 'Option 1', metricScores: [{ metricId: 'm1', score: 1 }] },
        { id: 'o2', text: 'Option 2', metricScores: [{ metricId: 'm1', score: 2 }] }
      ]
    },
    {
      id: 'q2',
      text: 'Question 2?',
      options: [
        { id: 'o3', text: 'Option 3', metricScores: [{ metricId: 'm1', score: 3 }] },
        { id: 'o4', text: 'Option 4', metricScores: [{ metricId: 'm1', score: 4 }] }
      ]
    }
  ]
};

export const mockResult: AssessmentResult = {
  assessmentId: 'assessment-1',
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
// Frontend only needs read and submit operations
export const handlers = [
  http.get('/api/assessments', () => {
    return HttpResponse.json<ApiResponse<Assessment[]>>({
      success: true,
      data: mockAssessments
    });
  }),
  http.get('/api/assessments/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json<ApiResponse<Assessment>>({
      success: true,
      data: { ...mockAssessment, id: id as string }
    });
  }),
  http.post('/api/assessments/:id/selections', () => {
    return HttpResponse.json<ApiResponse<AssessmentResult>>({
      success: true,
      data: mockResult
    });
  }),
];
