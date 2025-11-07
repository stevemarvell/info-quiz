import axios from 'axios';
import { Quiz, QuizResponse, QuizResult, ApiResponse, QuizSchema, QuizResultSchema } from '../types';
import { z } from 'zod';

const API_BASE_URL = '/api';

/**
 * Validate API response data with Zod schema
 * Provides runtime type safety for API responses
 */
const validateResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('API response validation failed:', error);
    throw new Error('Invalid API response format');
  }
};

// API responses are wrapped in { success: true, data: T }
export const api = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await axios.get<ApiResponse<Quiz[]>>(`${API_BASE_URL}/quizzes`);
    const quizzes = response.data.data;
    // Validate each quiz in the array
    return quizzes.map(quiz => validateResponse(QuizSchema, quiz));
  },

  async getQuiz(id: string): Promise<Quiz> {
    const response = await axios.get<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes/${id}`);
    return validateResponse(QuizSchema, response.data.data);
  },

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    const response = await axios.post<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes`, quiz);
    return validateResponse(QuizSchema, response.data.data);
  },

  async updateQuiz(id: string, quiz: Quiz): Promise<Quiz> {
    const response = await axios.put<ApiResponse<Quiz>>(`${API_BASE_URL}/quizzes/${id}`, quiz);
    return validateResponse(QuizSchema, response.data.data);
  },

  async deleteQuiz(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/quizzes/${id}`);
  },

  async submitQuiz(quizId: string, response: QuizResponse): Promise<QuizResult> {
    const result = await axios.post<ApiResponse<QuizResult>>(
      `${API_BASE_URL}/quizzes/${quizId}/submit`,
      response
    );
    return validateResponse(QuizResultSchema, result.data.data);
  }
};

