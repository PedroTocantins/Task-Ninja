export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const;
export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    createdAt: string;
    updatedAt: string;
}
