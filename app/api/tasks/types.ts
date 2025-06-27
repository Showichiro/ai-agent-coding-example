export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  due_date?: string
  created_at: string
  updated_at: string
}

export type TaskStatus = "todo" | "in_progress" | "done"

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  due_date?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  due_date?: string
}

export interface TaskValidationError {
  error: string
}

export interface DeleteTaskResponse {
  success: boolean
}