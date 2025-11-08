import { vi } from 'vitest';
import type { Assessment, AssessmentSelection, AssessmentResult } from '../../shared/types';

export const api = {
  getAllAssessments: vi.fn<[], Promise<Assessment[]>>(),
  getAssessment: vi.fn<[string], Promise<Assessment>>(),
  submitAssessment: vi.fn<[string, AssessmentSelection], Promise<AssessmentResult>>(),
};
