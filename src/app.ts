import express, { type Express } from 'express';
import { taskController } from './container';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found';
import { createTaskRouter } from './routes/task.routes';

// The app is built separately from server.ts so tests can import it without
// opening a network port.
export function createApp(): Express {
    const app = express();

    app.use(express.json());

    app.use('/tasks', createTaskRouter(taskController));

    // Order matters: these must come after all routes.
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
