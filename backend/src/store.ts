import { Quiz } from './types';

class DataStore {
  private quizzes: Map<string, Quiz> = new Map();

  getAllQuizzes(): Quiz[] {
    return Array.from(this.quizzes.values());
  }

  getQuiz(id: string): Quiz | undefined {
    return this.quizzes.get(id);
  }

  createQuiz(quiz: Quiz): Quiz {
    this.quizzes.set(quiz.id, quiz);
    return quiz;
  }

  updateQuiz(id: string, quiz: Quiz): Quiz | undefined {
    if (!this.quizzes.has(id)) {
      return undefined;
    }
    this.quizzes.set(id, quiz);
    return quiz;
  }

  deleteQuiz(id: string): boolean {
    return this.quizzes.delete(id);
  }
}

export const store = new DataStore();
