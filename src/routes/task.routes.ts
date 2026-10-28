import { Router } from 'express';
import type { TaskController } from '../controllers/task.controller';

export function createTaskRouter(taskController: TaskController): Router {
    const router = Router();

    router.get('/', taskController.list);
    router.get('/:id', taskController.listById);
    router.post('/', taskController.create);
    router.patch('/:id', taskController.update);
    router.delete('/:id', taskController.delete);

    return router;
}
