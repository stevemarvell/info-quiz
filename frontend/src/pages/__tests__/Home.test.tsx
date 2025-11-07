import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import * as api from '../../services/api';

// Mock the API module
vi.mock('../../services/api');

const mockQuizzes = [
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

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home page title', () => {
    vi.spyOn(api, 'getQuizzes').mockResolvedValue(mockQuizzes);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/quiz/i)).toBeInTheDocument();
  });

  it('should display quizzes after loading', async () => {
    vi.spyOn(api, 'getQuizzes').mockResolvedValue(mockQuizzes);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Assessment')).toBeInTheDocument();
    });
  });

  it('should display empty state when no quizzes', async () => {
    vi.spyOn(api, 'getQuizzes').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      const content = screen.getByText((content, element) => {
        return element?.textContent?.toLowerCase().includes('no quizzes') || false;
      });
      expect(content).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle API errors gracefully', async () => {
    vi.spyOn(api, 'getQuizzes').mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Component should not crash
    await waitFor(() => {
      expect(screen.getByText(/quiz/i)).toBeInTheDocument();
    });
  });
});
