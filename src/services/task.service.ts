import { NotFoundError } from '../errors/app-error';
import type { TaskRepository } from '../repositories/task.repository';
import type { Task } from '../types/task';

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

    async listTaskById(id: string): Promise<Task | null> {
        const task = await this.taskRepository.findById(id);

        if (!task) {
            throw new NotFoundError(`Task ${id} not found. `);
        }

        return task;
    }
}
