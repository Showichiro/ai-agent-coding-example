import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TaskStatus } from '@prisma/client'

// Unmock Prisma to use real client
vi.doUnmock('../lib/prisma')
vi.doUnmock('@prisma/client')

// Mock revalidatePath (still needed for Next.js functions)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createTask, getTasks } from '../actions'
import { revalidatePath } from 'next/cache'
import { prisma } from '../lib/prisma'

const mockRevalidatePath = vi.mocked(revalidatePath)

describe('Server Actions with Real Prisma', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Clean up test data
    await prisma.task.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.task.deleteMany()
  })

  describe('createTask', () => {
    it('should create a task with title only', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('title', 'Test Task')

      // Act
      const result = await createTask(formData)

      // Assert
      expect(result.title).toBe('Test Task')
      expect(result.description).toBeNull()
      expect(result.status).toBe(TaskStatus.TODO)
      expect(result.due_date).toBeNull()
      expect(result.id).toBeDefined()
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks')

      // Verify in database
      const dbTask = await prisma.task.findUnique({ where: { id: result.id } })
      expect(dbTask).toBeTruthy()
      expect(dbTask?.title).toBe('Test Task')
    })

    it('should create a task with all fields', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('title', 'Complete Task')
      formData.append('description', 'Task with description')
      formData.append('due_date', '2025-01-01T00:00:00.000Z')

      // Act
      const result = await createTask(formData)

      // Assert
      expect(result.title).toBe('Complete Task')
      expect(result.description).toBe('Task with description')
      expect(result.status).toBe(TaskStatus.TODO)
      expect(result.due_date).toEqual(new Date('2025-01-01T00:00:00.000Z'))
      expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks')

      // Verify in database
      const dbTask = await prisma.task.findUnique({ where: { id: result.id } })
      expect(dbTask).toBeTruthy()
      expect(dbTask?.description).toBe('Task with description')
    })

    it('should throw error for invalid title', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('title', '') // Empty title

      // Act & Assert
      await expect(createTask(formData)).rejects.toThrow()
    })
  })

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test data
      await prisma.task.create({
        data: {
          title: 'Task 1',
          status: TaskStatus.TODO,
          created_at: new Date('2025-01-01'),
        },
      })
      await prisma.task.create({
        data: {
          title: 'Task 2',
          description: 'Description',
          status: TaskStatus.IN_PROGRESS,
          due_date: new Date('2025-01-15'),
          created_at: new Date('2025-01-02'),
        },
      })
      await prisma.task.create({
        data: {
          title: 'Task 3',
          status: TaskStatus.DONE,
          created_at: new Date('2025-01-03'),
        },
      })
    })

    it('should get all tasks without filters', async () => {
      // Act
      const result = await getTasks()

      // Assert
      expect(result.tasks).toHaveLength(3)
      expect(result.total).toBe(3)
      // Should be sorted by created_at desc (newest first)
      expect(result.tasks[0].title).toBe('Task 3')
      expect(result.tasks[1].title).toBe('Task 2')
      expect(result.tasks[2].title).toBe('Task 1')
    })

    it('should filter tasks by status', async () => {
      // Act
      const result = await getTasks({ status: 'todo' })

      // Assert
      expect(result.tasks).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.tasks[0].title).toBe('Task 1')
      expect(result.tasks[0].status).toBe(TaskStatus.TODO)
    })

    it('should sort tasks by due_date ascending', async () => {
      // Act
      const result = await getTasks({ sort_by: 'due_date', sort_order: 'asc' })

      // Assert
      expect(result.tasks).toHaveLength(3)
      // Tasks with null due_date should come first in ascending order
      expect(result.tasks[2].title).toBe('Task 2') // Only task with due_date
    })

    it('should throw error for invalid filters', async () => {
      // Act & Assert
      await expect(getTasks({ status: 'invalid' })).rejects.toThrow()
    })
  })
})