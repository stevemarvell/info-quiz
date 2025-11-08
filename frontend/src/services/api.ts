import axios from 'axios';
import { Assessment, AssessmentSelection, AssessmentResult, ApiResponse } from '../shared/types';

const API_BASE_URL = '/api';

// API responses are wrapped in { success: true, data: T }
// Frontend only needs read and submit operations
export const api = {
  async getAllAssessments(): Promise<Assessment[]> {
    const response = await axios.get<ApiResponse<Assessment[]>>(`${API_BASE_URL}/assessments`);
    return response.data.data;
  },

  async getAssessment(id: string): Promise<Assessment> {
    const response = await axios.get<ApiResponse<Assessment>>(`${API_BASE_URL}/assessments/${id}`);
    return response.data.data;
  },

  async submitAssessment(assessmentId: string, selection: AssessmentSelection): Promise<AssessmentResult> {
    const result = await axios.post<ApiResponse<AssessmentResult>>(
      `${API_BASE_URL}/assessments/${assessmentId}/selections`,
      selection
    );
    return result.data.data;
  }
};

