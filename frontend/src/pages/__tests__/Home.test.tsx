import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { api } from '../../services/api';

// Use manual mock from __mocks__ directory
vi.mock('../../services/api');

const mockAssessments = [
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

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home page title', () => {
    vi.mocked(api.getAllAssessments).mockResolvedValue(mockAssessments);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Available Assessments/i)[0]).toBeInTheDocument();
  });

  it('should display assessments after loading', async () => {
    vi.mocked(api.getAllAssessments).mockResolvedValue(mockAssessments);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Wellbeing Assessment')).toBeInTheDocument();
    });
  });

  it('should display empty state when no assessments', async () => {
    vi.mocked(api.getAllAssessments).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No assessments available')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(api.getAllAssessments).mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Component should not crash
    await waitFor(() => {
      expect(screen.getAllByText(/Available Assessments/i)[0]).toBeInTheDocument();
    });
  });
});
