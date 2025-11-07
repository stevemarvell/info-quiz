import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TakeQuiz from '../TakeQuiz';
import { api } from '../../services/api';

// Use manual mock from __mocks__ directory
vi.mock('../../services/api');

const mockQuiz = {
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

const mockResult = {
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
    vi.clearAllMocks();
  });

  it('should load and display quiz', async () => {
    vi.mocked(api.getQuiz).mockResolvedValue(mockQuiz);

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TakeQuiz />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Quiz')).toBeInTheDocument();
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });
  });

  it('should navigate between questions', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getQuiz).mockResolvedValue(mockQuiz);

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TakeQuiz />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Select first answer
    const answer1Radio = screen.getByLabelText('Answer 1');
    await user.click(answer1Radio);

    // Click Next button
    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    // Should show question 2
    await waitFor(() => {
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });
  });

  it('should require answer selection before proceeding', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getQuiz).mockResolvedValue(mockQuiz);

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TakeQuiz />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Try to click Next without selecting answer
    const nextButton = screen.getByText(/next/i);

    // Button should be disabled or show validation message
    expect(nextButton).toBeDisabled();
  });

  it('should submit quiz and show results', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getQuiz).mockResolvedValue(mockQuiz);
    vi.mocked(api.submitQuiz).mockResolvedValue(mockResult);

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TakeQuiz />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
    });

    // Answer question 1
    const answer1 = screen.getByLabelText('Answer 1');
    await user.click(answer1);

    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    // Wait for question 2
    await waitFor(() => {
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });

    // Answer question 2
    const answer3 = screen.getByLabelText('Answer 3');
    await user.click(answer3);

    // Submit
    const submitButton = screen.getByText(/submit/i);
    await user.click(submitButton);

    // Should navigate to results or show success
    await waitFor(() => {
      expect(api.submitQuiz).toHaveBeenCalledWith('quiz-1', {
        quizId: 'quiz-1',
        answers: [
          { questionId: 'q1', answerId: 'a1' },
          { questionId: 'q2', answerId: 'a3' }
        ]
      });
    });
  });

  it('should handle API errors when loading quiz', async () => {
    vi.mocked(api.getQuiz).mockRejectedValue(new Error('Failed to load'));

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TakeQuiz />} />
        </Routes>
      </BrowserRouter>
    );

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});
