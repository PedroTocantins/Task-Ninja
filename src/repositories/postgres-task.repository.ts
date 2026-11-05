import { Pool } from 'pg';
import { Task, TaskPriority, TaskStatus } from '../types/task.js';
import { CreateTask, TaskRepository, UpdateTask } from './task.repository.js';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: Date;
  updated_at: Date;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresTaskRepository implements TaskRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Task[]> {
    const { rows } = await this.pool.query<TaskRow>('SELECT * FROM tasks');
    return rows.map(toTask);
  }

  async findById(id: string): Promise<Task | null> {
    const { rows } = await this.pool.query<TaskRow>('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0] ? toTask(rows[0]) : null;
  }

  async create({ title, description, status, priority }: CreateTask): Promise<Task> {
    const { rows } = await this.pool.query<TaskRow>(
      'INSERT INTO tasks (title, description, status, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, status, priority],
    );
    return toTask(rows[0]!);
  }

  async update(
    id: string,
    { title, description, status, priority }: UpdateTask,
  ): Promise<Task | null> {
    const existingTask = await this.findById(id);

    if (!existingTask) {
      return null;
    }

    const { rows } = await this.pool.query<TaskRow>(
      `UPDATE tasks SET 
                title = COALESCE($1, title), 
                description = COALESCE($2, description), 
                status = COALESCE($3, status), 
                priority = COALESCE($4, priority), 
                updated_at = NOW() 
                WHERE id = $5 RETURNING *`,
      [title, description, status, priority, id],
    );
    return rows[0] ? toTask(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (rowCount ?? 0) > 0;
  }
}
