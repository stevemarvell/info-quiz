import axios from 'axios';
import { Quiz, QuizResponse, QuizResult } from '../types';

const API_BASE_URL = '/api';

export const api = {
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await axios.get(`${API_BASE_URL}/quizzes`);
    return response.data;
  },

  async getQuiz(id: string): Promise<Quiz> {
    const response = await axios.get(`${API_BASE_URL}/quizzes/${id}`);
    return response.data;
  },

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    const response = await axios.post(`${API_BASE_URL}/quizzes`, quiz);
    return response.data;
  },

  async updateQuiz(id: string, quiz: Quiz): Promise<Quiz> {
    const response = await axios.put(`${API_BASE_URL}/quizzes/${id}`, quiz);
    return response.data;
  },

  async deleteQuiz(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/quizzes/${id}`);
  },

  async submitQuiz(quizId: string, response: QuizResponse): Promise<QuizResult> {
    const result = await axios.post(`${API_BASE_URL}/quizzes/${quizId}/submit`, response);
    return result.data;
  }
};
