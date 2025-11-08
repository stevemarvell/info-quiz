import { AssessmentSelection, AssessmentResult } from '../shared';

export interface IAssessmentSelectionRepository {
  save(selection: AssessmentSelection, result: AssessmentResult): Promise<void>;
  findByAssessmentId(assessmentId: string): Promise<Array<{ selection: AssessmentSelection; result: AssessmentResult }>>;
  findById(selectionId: string): Promise<{ selection: AssessmentSelection; result: AssessmentResult } | null>;
}
