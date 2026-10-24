import type { Task } from '../types/task';

// The contract the service depends on. A JSON, PostgreSQL or MongoDB
// implementation only has to satisfy this interface.
export interface TaskRepository {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
}
