// Task types based on Prisma schema and Server Actions design

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export const TaskStatus = {
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  DONE: 'DONE' as const,
} as const;

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Server Actions response type
export type ActionState = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

// Task query options
export type GetTasksOptions = {
  sortBy?: 'created_at' | 'due_date';
  sortOrder?: 'asc' | 'desc';
  statusFilter?: TaskStatus | 'all';
  limit?: number;
  offset?: number;
};

// Task query result
export type GetTasksResult = {
  tasks: Task[];
  count: number;
  hasMore: boolean;
};

// Task creation input
export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string; // ISO string
};

// Task update input
export type UpdateTaskInput = {
  title?: string;
  description?: string;
  dueDate?: string; // ISO string
};

// Task status update input
export type UpdateTaskStatusInput = {
  taskId: string;
  status: TaskStatus;
};