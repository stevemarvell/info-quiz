import { AssessmentSelection, AssessmentResult } from '../shared';
import { IAssessmentSelectionRepository } from './IAssessmentSelectionRepository';
import { logger } from '../utils/logger';

interface StoredSelection {
  id: string;
  selection: AssessmentSelection;
  result: AssessmentResult;
  timestamp: Date;
}

export class InMemoryAssessmentSelectionRepository implements IAssessmentSelectionRepository {
  private selections: Map<string, StoredSelection> = new Map();
  private selectionIdCounter = 1;

  async save(selection: AssessmentSelection, result: AssessmentResult): Promise<void> {
    const id = `selection-${this.selectionIdCounter++}`;
    logger.info(`AssessmentSelectionRepository: Saving selection with id: ${id}`);

    const stored: StoredSelection = {
      id,
      selection,
      result,
      timestamp: new Date()
    };

    this.selections.set(id, stored);
  }

  async findByAssessmentId(assessmentId: string): Promise<Array<{ selection: AssessmentSelection; result: AssessmentResult }>> {
    logger.debug(`AssessmentSelectionRepository: Finding selections for assessment: ${assessmentId}`);

    const selections = Array.from(this.selections.values())
      .filter(s => s.selection.assessmentId === assessmentId)
      .map(s => ({ selection: s.selection, result: s.result }));

    return selections;
  }

  async findById(selectionId: string): Promise<{ selection: AssessmentSelection; result: AssessmentResult } | null> {
    logger.debug(`AssessmentSelectionRepository: Finding selection by id: ${selectionId}`);

    const stored = this.selections.get(selectionId);
    if (!stored) {
      return null;
    }

    return {
      selection: stored.selection,
      result: stored.result
    };
  }

  // Test helper methods
  clear(): void {
    this.selections.clear();
    this.selectionIdCounter = 1;
  }

  size(): number {
    return this.selections.size;
  }
}
