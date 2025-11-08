import { Assessment } from '../shared';

export interface IAssessmentRepository {
  findAll(): Promise<Assessment[]>;
  findById(id: string): Promise<Assessment | null>;
  create(assessment: Assessment): Promise<Assessment>;
  update(id: string, assessment: Assessment): Promise<Assessment | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
