import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import TakeQuiz from '../TakeQuiz';
import { server } from '../../mocks/server';
import type { ApiResponse, Quiz, QuizResult } from '../../types';

// Chicago/classicist approach: No module mocking!
// MSW intercepts network requests, components use real API service

const mockQuiz: Quiz = {
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

const mockResult: QuizResult = {
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

describe('TakeQuiz Component', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('should load and display quiz', async () => {
    // Override MSW handler to return our test quiz
    server.use(
      http.get('/api/quizzes/quiz-1', () => {
        return HttpResponse.json<ApiResponse<Quiz>>({
          success: true,
          data: mockQuiz
        });
      })
    );

    render(
      <MemoryRouter initialEntries={['/quiz/quiz-1']}>
        <Switch>
          <Route path="/quiz/:id" component={TakeQuiz} />
        </Switch>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });
  });

  it('should navigate between questions', async () => {
    server.use(
      http.get('/api/quizzes/quiz-1', () => {
        return HttpResponse.json<ApiResponse<Quiz>>({
          success: true,
          data: mockQuiz
        });
      })
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/quiz/quiz-1']}>
        <Switch>
          <Route path="/quiz/:id" component={TakeQuiz} />
        </Switch>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Select first answer
    const radioButtons = screen.getAllByRole('radio');
    await user.click(radioButtons[0]);

    // Click next
    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    // Should show question 2
    expect(await screen.findByText('Question 2?')).toBeInTheDocument();
  });

  it('should require answer selection before proceeding', async () => {
    server.use(
      http.get('/api/quizzes/quiz-1', () => {
        return HttpResponse.json<ApiResponse<Quiz>>({
          success: true,
          data: mockQuiz
        });
      })
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/quiz/quiz-1']}>
        <Switch>
          <Route path="/quiz/:id" component={TakeQuiz} />
        </Switch>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Try to click next without selecting an answer
    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    // Should still be on question 1 or show validation message
    expect(screen.getByText('Question 1?')).toBeInTheDocument();
  });

  it('should submit quiz and show results', async () => {
    server.use(
      http.get('/api/quizzes/quiz-1', () => {
        return HttpResponse.json<ApiResponse<Quiz>>({
          success: true,
          data: mockQuiz
        });
      }),
      http.post('/api/quizzes/quiz-1/responses', () => {
        return HttpResponse.json<ApiResponse<QuizResult>>({
          success: true,
          data: mockResult
        });
      })
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/quiz/quiz-1']}>
        <Switch>
          <Route path="/quiz/:id" component={TakeQuiz} />
        </Switch>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Answer question 1
    const q1Radio = screen.getAllByRole('radio');
    await user.click(q1Radio[0]);

    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    // Answer question 2
    await waitFor(() => {
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });

    const q2Radio = screen.getAllByRole('radio');
    await user.click(q2Radio[0]);

    // Submit quiz
    const submitButton = screen.getByText(/submit/i);
    await user.click(submitButton);

    // Check for results
    await waitFor(() => {
      expect(screen.getByText(/metric 1/i)).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument();
    });
  });

  it('should handle API errors when loading quiz', async () => {
    // Override MSW handler to return error
    server.use(
      http.get('/api/quizzes/quiz-1', () => {
        return HttpResponse.json<ApiResponse<never>>({
          success: false,
          error: 'NOT_FOUND',
          message: 'Quiz not found'
        }, { status: 404 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/quiz/quiz-1']}>
        <Switch>
          <Route path="/quiz/:id" component={TakeQuiz} />
        </Switch>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/quiz not found/i)).toBeInTheDocument();
    });
  });
});
