import axios from 'axios';
import { Quiz, QuizResponse, QuizResult, ApiResponse } from '../types';

const API_BASE_URL = '/api';

// API responses are wrapped in { success: true, data: T }
export const api = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await axios.get<ApiResponse<Quiz[]>>(`${API_BASE_URL}/quizzes`);
    return response.data.data;
  },

  async getQuiz(id: string): Promise<Quiz> {
    const response = await axios.get<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes/${id}`);
    return response.data.data;
  },

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    const response = await axios.post<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes`, quiz);
    return response.data.data;
  },

  async updateQuiz(id: string, quiz: Quiz): Promise<Quiz> {
    const response = await axios.put<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes/${id}`, quiz);
    return response.data.data;
  },

  async deleteQuiz(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/quizzes/${id}`);
  },

  async submitQuiz(quizId: string, response: QuizResponse): Promise<QuizResult> {
    const result = await axios.post<ApiResponse<QuizResult>>(
      `${API_BASE_URL}/quizzes/${quizId}/responses`,
      response
    );
    return result.data.data;
  }
};

