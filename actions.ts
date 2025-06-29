'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from './lib/prisma'

// Zod schemas for input validation
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  due_date: z.string().datetime().optional(),
})

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  due_date: z.string().datetime().optional().nullable(),
})

const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])

const TaskFiltersSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'all']).optional(),
  sort_by: z.enum(['created_at', 'due_date', 'title', 'status']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
})

// Server Actions
/**
 * Creates a new task with the provided form data
 * @param formData - Form data containing title, description (optional), and due_date (optional)
 * @returns The created task object
 */
export async function createTask(formData: FormData) {
  // Extract and validate input data
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    due_date: formData.get('due_date'),
  }

  // Validate with Zod schema
  const validatedData = CreateTaskSchema.parse({
    title: rawData.title,
    description: rawData.description || undefined,
    due_date: rawData.due_date || undefined,
  })

  // Create task in database
  const task = await prisma.task.create({
    data: {
      title: validatedData.title,
      description: validatedData.description || null,
      dueDate: validatedData.due_date ? new Date(validatedData.due_date) : null,
    },
  })

  // Revalidate tasks page cache
  revalidatePath('/tasks')

  return task
}

/**
 * Retrieves tasks with optional filtering and sorting
 * @param filters - Optional filters for status, sorting field, and sort order
 * @returns Object containing tasks array and total count
 */
export async function getTasks(filters?: { status?: string; sort_by?: string; sort_order?: string }) {
  // Validate filters with Zod
  const validatedFilters = TaskFiltersSchema.parse(filters || {})

  // Build where clause
  const where: any = {}
  if (validatedFilters.status && validatedFilters.status !== 'all') {
    // Map frontend status to database enum
    const statusMap = {
      'todo': 'TODO',
      'in_progress': 'IN_PROGRESS',
      'done': 'DONE'
    }
    where.status = statusMap[validatedFilters.status as keyof typeof statusMap]
  }

  // Build orderBy clause
  const orderBy: any = {}
  const sortField = validatedFilters.sort_by || 'created_at'
  const sortOrder = validatedFilters.sort_order || 'desc'
  orderBy[sortField] = sortOrder

  // Query database
  const tasks = await prisma.task.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    orderBy,
  })

  return {
    tasks,
    total: tasks.length,
  }
}

export async function updateTask(id: string, formData: FormData) {
  // Implementation will be added following TDD
  throw new Error('Not implemented')
}

export async function deleteTask(id: string) {
  // Implementation will be added following TDD
  throw new Error('Not implemented')
}

export async function updateTaskStatus(id: string, status: string) {
  // Implementation will be added following TDD
  throw new Error('Not implemented')
}