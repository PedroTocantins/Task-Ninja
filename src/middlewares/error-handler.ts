import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import type { ErrorResponse } from '../types/api-response';

// Express recognises error middleware by its 4 parameters, so `_next` must stay
// even though it is unused.
export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response<ErrorResponse>,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
        return;
    }

    // Unknown errors are bugs: log the details, but never leak them to clients.
    console.error('[errorHandler] Unexpected error:', err);
    res.status(500).json({
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    });
}
