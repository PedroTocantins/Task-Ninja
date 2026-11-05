import { pool } from './database/pool.js';
import { PostgresTaskRepository } from './repositories/postgres-task.repository.js';
import { TaskService } from './services/task.service.js';
import { TaskController } from './controllers/task.controller.js';

// Composition root: the only place that knows which concrete classes are used.
// Swapping the data source means changing one line here.
const taskRepository = new PostgresTaskRepository(pool);
const taskService = new TaskService(taskRepository);
export const taskController = new TaskController(taskService);
