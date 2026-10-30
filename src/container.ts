import { env } from './config/env.js';
import { TaskController } from './controllers/task.controller.js';
import { JsonTaskRepository } from './repositories/json-task.repository.js';
import { TaskService } from './services/task.service.js';

// Composition root: the only place that knows which concrete classes are used.
// Swapping the data source means changing one line here.
const taskRepository = new JsonTaskRepository(env.tasksFilePath);
const taskService = new TaskService(taskRepository);
export const taskController = new TaskController(taskService);
