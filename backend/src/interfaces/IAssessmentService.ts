import { Assessment, AssessmentSelection, AssessmentResult } from '../shared';

export interface IAssessmentService {
  calculateResults(assessment: Assessment, selection: AssessmentSelection): AssessmentResult;
  validateAssessmentSelection(assessment: Assessment, selection: AssessmentSelection): { valid: boolean; errors: string[] };
}
