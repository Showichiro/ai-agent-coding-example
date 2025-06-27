import { CreateTaskRequest, UpdateTaskRequest } from './types'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateTitle(title: string | undefined): void {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new ValidationError('Title is required')
  }
  if (title.trim().length > 255) {
    throw new ValidationError('Title must be 255 characters or less')
  }
}

export function validateDescription(description: string | undefined): void {
  if (description !== undefined && description.length > 2000) {
    throw new ValidationError('Description must be 2000 characters or less')
  }
}

export function validateStatus(status: string | undefined): void {
  if (status && !['todo', 'in_progress', 'done'].includes(status)) {
    throw new ValidationError('Status must be one of: todo, in_progress, done')
  }
}

export function validateDueDate(due_date: string | undefined): void {
  if (due_date) {
    const dueDate = new Date(due_date)
    if (isNaN(dueDate.getTime())) {
      throw new ValidationError('Due date must be a valid ISO date string')
    }
  }
}

export function validateCreateTaskData(data: CreateTaskRequest): void {
  validateTitle(data.title)
  validateDescription(data.description)
  validateStatus(data.status)
  validateDueDate(data.due_date)
}

export function validateUpdateTaskData(data: UpdateTaskRequest): void {
  if (data.title !== undefined) {
    validateTitle(data.title)
  }
  validateDescription(data.description)
  validateStatus(data.status)
  validateDueDate(data.due_date)
}