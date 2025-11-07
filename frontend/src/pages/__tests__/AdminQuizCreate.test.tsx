import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminQuizCreate from '../AdminQuizCreate';
import * as api from '../../services/api';

// Mock the API
vi.mock('../../services/api');

describe('AdminQuizCreate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create quiz form', () => {
    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    expect(screen.getByText(/create quiz/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should add new metric', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    const addMetricButton = screen.getByText(/add metric/i);
    await user.click(addMetricButton);

    // Should show metric fields
    expect(screen.getByText(/metric #1/i)).toBeInTheDocument();
  });

  it('should add new question', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    const addQuestionButton = screen.getByText(/add question/i);
    await user.click(addQuestionButton);

    // Should show question fields
    expect(screen.getByText(/question #1/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createQuiz).mockResolvedValue({} as any);

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByText(/create quiz/i);
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/title.*required/i)).toBeInTheDocument();
    });

    // API should not be called
    expect(api.createQuiz).not.toHaveBeenCalled();
  });

  it('should successfully create quiz with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createQuiz).mockResolvedValue({
      id: 'new-quiz',
      title: 'My Test Quiz',
      description: 'Test description',
      metrics: [],
      questions: []
    });

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    // Fill in title
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'My Test Quiz');

    // Fill in description
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test description');

    // Add metric
    const addMetricButton = screen.getByText(/add metric/i);
    await user.click(addMetricButton);

    const metricNameInput = screen.getByLabelText(/metric name/i);
    await user.type(metricNameInput, 'Health');

    // Add question
    const addQuestionButton = screen.getByText(/add question/i);
    await user.click(addQuestionButton);

    const questionTextInput = screen.getByLabelText(/question text/i);
    await user.type(questionTextInput, 'How are you?');

    // Add answer
    const addAnswerButton = screen.getByText(/add answer/i);
    await user.click(addAnswerButton);
    await user.click(addAnswerButton); // Need at least 2 answers

    // Submit form
    const submitButton = screen.getByText(/create quiz/i);
    await user.click(submitButton);

    // Should call API
    await waitFor(() => {
      expect(api.createQuiz).toHaveBeenCalled();
    });
  });

  it('should handle API errors during submission', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createQuiz).mockRejectedValue(new Error('Server error'));

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    // Fill minimal data
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Test Quiz');

    // Submit
    const submitButton = screen.getByText(/create quiz/i);
    await user.click(submitButton);

    // Should handle error (show toast)
    await waitFor(() => {
      expect(api.createQuiz).toHaveBeenCalled();
    });

    // Toast notification should appear
    await waitFor(() => {
      expect(screen.queryByTestId('toast')).toBeInTheDocument();
    });
  });

  it('should remove metric when delete button clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AdminQuizCreate />
      </BrowserRouter>
    );

    // Add metric
    const addMetricButton = screen.getByText(/add metric/i);
    await user.click(addMetricButton);

    expect(screen.getByText(/metric #1/i)).toBeInTheDocument();

    // Click delete
    const deleteButton = screen.getByLabelText(/delete metric/i);
    await user.click(deleteButton);

    // Metric should be removed
    await waitFor(() => {
      expect(screen.queryByText(/metric #1/i)).not.toBeInTheDocument();
    });
  });
});
