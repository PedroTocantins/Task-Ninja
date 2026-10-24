import type { Request, Response } from 'express';
import type { TaskService } from '../services/task.service';
import type { SuccessResponse } from '../types/api-response';
import type { Task } from '../types/task';

// Controllers only translate HTTP <-> service calls. No try/catch needed:
// Express 5 forwards rejected promises to the error-handling middleware.
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    list = async (
        _req: Request,
        res: Response<SuccessResponse<Task[]>>,
    ): Promise<void> => {
        const tasks = await this.taskService.listTasks();
        res.status(200).json({ data: tasks });
    };

    listById = async (
        req: Request<{ id: string }>,
        res: Response<SuccessResponse<Task | null>>,
    ): Promise<void> => {
        const { id } = req.params;
        const task = await this.taskService.listTaskById(id);
        res.status(200).json({ data: task });
    };
}
