import type { Task, TaskPriority, TaskStatus } from '../types/task';

// The contract the service depends on. A JSON, PostgreSQL or MongoDB
// implementation only has to satisfy this interface.
export interface CreateTask {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
}

export type UpdateTask = Partial<CreateTask>;
export interface TaskRepository {
    findAll(): Promise<Task[]>;
    findById(id: string): Promise<Task | null>;
    create(task: CreateTask): Promise<Task>;
    update(id: string, task: UpdateTask): Promise<Task | null>;
    delete(id: string): Promise<boolean>;
}
