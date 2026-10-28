// Errors the app throws on purpose. Anything that is not an AppError is
// treated as an unexpected bug and reported as a generic 500.
export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string,
    ) {
        super(message);
        this.name = new.target.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class DataSourceError extends AppError {
    constructor(message = 'Failed to access the data source') {
        super(message, 500, 'DATA_SOURCE_ERROR');
    }
}

export class TaskNotFoundError extends NotFoundError {
    constructor(id: string) {
        super(`Task ${id} not found.`);
    }
}
