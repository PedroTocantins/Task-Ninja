import { TaskNotFoundError } from '../errors/app-error.js';
import type {
    CreateTask,
    TaskRepository,
    UpdateTask,
} from '../repositories/task.repository.js';
import type { Task } from '../types/task.js';

export class TaskService {
    // Depends on the interface, not JsonTaskRepository: the concrete class is
    // chosen in container.ts.
    constructor(private readonly taskRepository: TaskRepository) {}

    async listTasks(): Promise<Task[]> {
        const tasks = await this.taskRepository.findAll();
        // Business rule: newest tasks first. Sorting lives here, not in the
        // repository, so it survives a change of data source.
        return [...tasks].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt),
        );
    }

    async getTaskById(id: string): Promise<Task | null> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new TaskNotFoundError(id);
        }

        return task;
    }

    async createTask(task: CreateTask): Promise<Task> {
        return this.taskRepository.create(task);
    }

    async updateTask(id: string, task: UpdateTask): Promise<Task | null> {
        const updatedTask = await this.taskRepository.update(id, task);

        if (!updatedTask) {
            throw new TaskNotFoundError(id);
        }

        return updatedTask;
    }

    async deleteTask(id: string): Promise<void> {
        const deleted = await this.taskRepository.delete(id);

        if (!deleted) {
            throw new TaskNotFoundError(id);
        }
    }
}
