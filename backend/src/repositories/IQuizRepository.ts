import { Quiz } from '../shared';

export interface IQuizRepository {
  findAll(): Promise<Quiz[]>;
  findById(id: string): Promise<Quiz | null>;
  create(quiz: Quiz): Promise<Quiz>;
  update(id: string, quiz: Quiz): Promise<Quiz | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
