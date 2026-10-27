import { readFile, writeFile } from 'node:fs/promises';
import { DataSourceError } from '../errors/app-error';
import { TASK_STATUSES, type Task } from '../types/task';
import type { CreateTask, TaskRepository } from './task.repository';

function isTask(value: unknown): value is Task {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.id === 'string' &&
        typeof v.title === 'string' &&
        typeof v.description === 'string' &&
        typeof v.status === 'string' &&
        (TASK_STATUSES as readonly string[]).includes(v.status) &&
        typeof v.createdAt === 'string' &&
        typeof v.updatedAt === 'string'
    );
}

export class JsonTaskRepository implements TaskRepository {
    constructor(private readonly filePath: string) {}

    async create({
        title,
        description,
        status,
        priority,
    }: CreateTask): Promise<Task> {
        const parsed = await this.readTasks();
        const newTask: Task = {
            id: crypto.randomUUID(),
            title: title,
            description: description,
            status: status,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        parsed.push(newTask);
        try {
            await writeFile(
                this.filePath,
                JSON.stringify(parsed, null, 2),
                'utf-8',
            );
        } catch (err) {
            console.error(
                `[JsonTaskRepository] Could not write ${this.filePath}:`,
                err,
            );
            throw new DataSourceError('Could not write tasks data');
        }

        return newTask;
    }

    async findById(id: string): Promise<Task | null> {
        const parsed = await this.readTasks();
        const task = parsed.find((t) => t.id === id);
        return task ?? null;
    }

    async findAll(): Promise<Task[]> {
        return this.readTasks();
    }

    private async readTasks(): Promise<Task[]> {
        let raw: string;
        try {
            raw = await readFile(this.filePath, 'utf-8');
        } catch (err) {
            // Log the low-level cause here; callers only see a domain-level error.
            console.error(
                `[JsonTaskRepository] Could not read ${this.filePath}:`,
                err,
            );
            throw new DataSourceError('Could not read tasks data');
        }

        // JSON.parse returns `any`; treating it as `unknown` forces validation
        // before the data is trusted as Task[].
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new DataSourceError('Tasks data file contains invalid JSON');
        }

        if (!Array.isArray(parsed) || !parsed.every(isTask)) {
            throw new DataSourceError('Tasks data file has an invalid format');
        }

        return parsed;
    }
}
