import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock revalidatePath (must be hoisted)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock prisma (must be hoisted)
vi.mock('../lib/prisma', () => ({
  prisma: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { createTask, getTasks } from '../actions'
import { revalidatePath } from 'next/cache'
import { prisma } from '../lib/prisma'

const mockRevalidatePath = vi.mocked(revalidatePath)
const mockPrisma = vi.mocked(prisma)

describe('createTask Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a task with title only', async () => {
    // Arrange
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: null,
      status: 'TODO',
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    }
    mockPrisma.task.create.mockResolvedValue(mockTask)

    const formData = new FormData()
    formData.append('title', 'Test Task')

    // Act
    const result = await createTask(formData)

    // Assert
    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Task',
        description: null,
        due_date: null,
      },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks')
    expect(result).toEqual(mockTask)
  })

  it('should create a task with all fields', async () => {
    // Arrange
    const mockTask = {
      id: '2',
      title: 'Complete Task',
      description: 'Task with description',
      status: 'TODO',
      due_date: new Date('2025-01-01'),
      created_at: new Date(),
      updated_at: new Date(),
    }
    mockPrisma.task.create.mockResolvedValue(mockTask)

    const formData = new FormData()
    formData.append('title', 'Complete Task')
    formData.append('description', 'Task with description')
    formData.append('due_date', '2025-01-01T00:00:00.000Z')

    // Act
    const result = await createTask(formData)

    // Assert
    expect(mockPrisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Complete Task',
        description: 'Task with description',
        due_date: new Date('2025-01-01T00:00:00.000Z'),
      },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/tasks')
    expect(result).toEqual(mockTask)
  })

  it('should throw error for invalid title', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('title', '') // Empty title

    // Act & Assert
    await expect(createTask(formData)).rejects.toThrow()
  })

  it('should throw error for title too long', async () => {
    // Arrange
    const formData = new FormData()
    formData.append('title', 'a'.repeat(101)) // Title too long

    // Act & Assert
    await expect(createTask(formData)).rejects.toThrow()
  })
})

describe('getTasks Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should get all tasks without filters', async () => {
    // Arrange
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: null,
        status: 'TODO',
        due_date: null,
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description',
        status: 'IN_PROGRESS',
        due_date: new Date('2025-01-15'),
        created_at: new Date('2025-01-02'),
        updated_at: new Date('2025-01-02'),
      },
    ]
    mockPrisma.task.findMany.mockResolvedValue(mockTasks)

    // Act
    const result = await getTasks()

    // Assert
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      orderBy: { created_at: 'desc' },
    })
    expect(result).toEqual({ tasks: mockTasks, total: 2 })
  })

  it('should filter tasks by status', async () => {
    // Arrange
    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: null,
        status: 'TODO',
        due_date: null,
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
      },
    ]
    mockPrisma.task.findMany.mockResolvedValue(mockTasks)

    // Act
    const result = await getTasks({ status: 'todo' })

    // Assert
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      where: { status: 'TODO' },
      orderBy: { created_at: 'desc' },
    })
    expect(result).toEqual({ tasks: mockTasks, total: 1 })
  })

  it('should sort tasks by due_date ascending', async () => {
    // Arrange
    const mockTasks = []
    mockPrisma.task.findMany.mockResolvedValue(mockTasks)

    // Act
    const result = await getTasks({ sort_by: 'due_date', sort_order: 'asc' })

    // Assert
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      orderBy: { due_date: 'asc' },
    })
    expect(result).toEqual({ tasks: mockTasks, total: 0 })
  })

  it('should throw error for invalid filters', async () => {
    // Act & Assert
    await expect(getTasks({ status: 'invalid' })).rejects.toThrow()
  })
})