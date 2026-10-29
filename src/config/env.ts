import 'dotenv/config';
import path from 'node:path';

// Environment is read and validated once at startup, so the rest of the app
// imports a typed object instead of touching process.env directly.
function parsePort(value: string | undefined): number {
    const port = Number(value ?? 3000);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid PORT: "${value}"`);
    }
    return port;
}

function parseDatabaseUrl(value: string | undefined): string {
    if (!value) {
        throw new Error(`DATABASE_URL is not set`);
    }
    return value;
}

export const env = {
    port: parsePort(process.env.PORT),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    tasksFilePath: path.resolve(
        process.cwd(),
        process.env.TASKS_FILE_PATH ?? 'data/tasks.json',
    ),
    databaseUrl: parseDatabaseUrl(process.env.DATABASE_URL),
} as const;
