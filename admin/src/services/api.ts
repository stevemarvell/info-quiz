import axios from 'axios';
import { Assessment } from '../shared/types';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  async getAllAssessments(): Promise<Assessment[]> {
    const response = await apiClient.get('/assessments');
    return response.data.data;
  },

  async getAssessment(id: string): Promise<Assessment> {
    const response = await apiClient.get(`/assessments/${id}`);
    return response.data.data;
  },

  async createAssessment(assessment: Assessment): Promise<Assessment> {
    const response = await apiClient.post('/assessments', assessment);
    return response.data.data;
  },

  async updateAssessment(id: string, assessment: Assessment): Promise<Assessment> {
    const response = await apiClient.put(`/assessments/${id}`, assessment);
    return response.data.data;
  },

  async deleteAssessment(id: string): Promise<void> {
    await apiClient.delete(`/assessments/${id}`);
  }
};
