import { readFile, writeFile } from 'node:fs/promises';
import { DataSourceError } from '../errors/app-error';
import { TASK_STATUSES, type Task } from '../types/task';
import type { CreateTask, TaskRepository, UpdateTask } from './task.repository';
import { randomUUID } from 'node:crypto';

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
        const tasks = await this.readTasks();
        const date = new Date().toISOString();
        const newTask: Task = {
            id: randomUUID(),
            title,
            description,
            status,
            priority,
            createdAt: date,
            updatedAt: date,
        };

        tasks.push(newTask);

        await this.writeTasks(tasks);

        return newTask;
    }

    async findById(id: string): Promise<Task | null> {
        const tasks = await this.readTasks();
        const task = tasks.find((t) => t.id === id);
        return task ?? null;
    }

    async findAll(): Promise<Task[]> {
        return this.readTasks();
    }

    async update(id: string, task: UpdateTask): Promise<Task | null> {
        const tasks = await this.readTasks();
        const targetTask = tasks.find((t) => t.id === id);
        if (!targetTask) {
            return null;
        }

        const updatedTask: Task = {
            ...targetTask,
            ...task,
            updatedAt: new Date().toISOString(),
        };

        const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t));

        await this.writeTasks(updatedTasks);

        return updatedTask;
    }

    async delete(id: string): Promise<void> {
        const tasks = await this.readTasks();
        const deleteTask = tasks.find((t) => t.id === id);

        if (!deleteTask) {
            throw new DataSourceError(`Task with id ${id} not found`);
        }

        const updatedTasks = tasks.filter((t) => t.id !== id);
        await this.writeTasks(updatedTasks);
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

    private async writeTasks(tasks: Task[]): Promise<void> {
        try {
            await writeFile(
                this.filePath,
                JSON.stringify(tasks, null, 2),
                'utf-8',
            );
        } catch (err) {
            console.error(
                `[JsonTaskRepository] Could not write ${this.filePath}:`,
                err,
            );
            throw new DataSourceError('Could not write tasks data');
        }
    }
}
