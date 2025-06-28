import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Task Database CRUD Operations (Real Database)', () => {
  let PrismaClient: any
  let TaskStatus: any
  let prisma: any

  beforeEach(async () => {
    // Unmock Prisma to use real client
    vi.doUnmock('@prisma/client')
    
    // Import real Prisma client
    const prismaModule = await import('@prisma/client')
    PrismaClient = prismaModule.PrismaClient
    TaskStatus = prismaModule.TaskStatus
    
    // Create real Prisma instance
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    })
    
    // Clean database before each test
    await prisma.task.deleteMany()
  })

  afterEach(async () => {
    // Clean database after each test
    await prisma.task.deleteMany()
    await prisma.$disconnect()
  })

  describe('Task Creation', () => {
    it('should create task with required fields only', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test task',
          status: TaskStatus.TODO
        }
      })

      expect(task).toMatchObject({
        id: expect.any(String),
        title: 'Test task',
        description: null,
        status: TaskStatus.TODO,
        due_date: null,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      })
    })

    it('should create task with all optional fields', async () => {
      const dueDate = new Date('2024-12-31')
      const task = await prisma.task.create({
        data: {
          title: 'Complete task',
          description: 'Task with full details',
          status: TaskStatus.IN_PROGRESS,
          due_date: dueDate
        }
      })

      expect(task).toMatchObject({
        id: expect.any(String),
        title: 'Complete task',
        description: 'Task with full details',
        status: TaskStatus.IN_PROGRESS,
        due_date: dueDate,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      })
    })

    it('should auto-generate UUID for id field', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'UUID test task',
          status: TaskStatus.TODO
        }
      })

      expect(task.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should set default status to TODO when not specified', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Default status task'
        }
      })

      expect(task.status).toBe(TaskStatus.TODO)
    })

    it('should allow empty title (SQLite behavior)', async () => {
      // Note: SQLite doesn't enforce string length constraints at DB level
      // This would be validated at the application/Zod schema level
      const task = await prisma.task.create({
        data: {
          title: '',
          status: TaskStatus.TODO
        }
      })
      
      expect(task.title).toBe('')
    })

    it('should support null description', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task with null description',
          description: null,
          status: TaskStatus.TODO
        }
      })

      expect(task.description).toBeNull()
    })

    it('should support all TaskStatus enum values', async () => {
      const statusValues = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]
      
      for (const status of statusValues) {
        const task = await prisma.task.create({
          data: {
            title: `Task with ${status} status`,
            status
          }
        })
        expect(task.status).toBe(status)
      }
    })
  })

  describe('Task Reading/Querying', () => {
    it('should find task by id', async () => {
      const created = await prisma.task.create({
        data: {
          title: 'Find me',
          status: TaskStatus.TODO
        }
      })

      const found = await prisma.task.findUnique({
        where: { id: created.id }
      })

      expect(found).toMatchObject({
        id: created.id,
        title: 'Find me',
        status: TaskStatus.TODO
      })
    })

    it('should return null for non-existent task', async () => {
      const nonExistent = await prisma.task.findUnique({
        where: { id: 'non-existent-id' }
      })

      expect(nonExistent).toBeNull()
    })

    it('should filter tasks by status', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Todo Task', status: TaskStatus.TODO },
          { title: 'In Progress Task', status: TaskStatus.IN_PROGRESS },
          { title: 'Done Task', status: TaskStatus.DONE }
        ]
      })

      const todoTasks = await prisma.task.findMany({
        where: { status: TaskStatus.TODO }
      })

      expect(todoTasks).toHaveLength(1)
      expect(todoTasks[0].title).toBe('Todo Task')
    })

    it('should sort tasks by created_at ascending', async () => {
      const task1 = await prisma.task.create({
        data: { title: 'First Task', status: TaskStatus.TODO }
      })
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const task2 = await prisma.task.create({
        data: { title: 'Second Task', status: TaskStatus.TODO }
      })

      const tasks = await prisma.task.findMany({
        orderBy: { created_at: 'asc' }
      })

      expect(tasks[0].id).toBe(task1.id)
      expect(tasks[1].id).toBe(task2.id)
    })

    it('should find all tasks when no filter applied', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: TaskStatus.TODO },
          { title: 'Task 2', status: TaskStatus.IN_PROGRESS },
          { title: 'Task 3', status: TaskStatus.DONE }
        ]
      })

      const allTasks = await prisma.task.findMany()
      expect(allTasks).toHaveLength(3)
    })

    it('should sort tasks by title alphabetically', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Zebra Task', status: TaskStatus.TODO },
          { title: 'Alpha Task', status: TaskStatus.TODO },
          { title: 'Beta Task', status: TaskStatus.TODO }
        ]
      })

      const tasks = await prisma.task.findMany({
        orderBy: { title: 'asc' }
      })

      expect(tasks[0].title).toBe('Alpha Task')
      expect(tasks[1].title).toBe('Beta Task')
      expect(tasks[2].title).toBe('Zebra Task')
    })
  })

  describe('Task Updates', () => {
    it('should update task title', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Original Title',
          status: TaskStatus.TODO
        }
      })

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { title: 'Updated Title' }
      })

      expect(updated.title).toBe('Updated Title')
      expect(updated.updated_at.getTime()).toBeGreaterThan(task.updated_at.getTime())
    })

    it('should update task status', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          status: TaskStatus.TODO
        }
      })

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { status: TaskStatus.DONE }
      })

      expect(updated.status).toBe(TaskStatus.DONE)
    })

    it('should update task description', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          status: TaskStatus.TODO
        }
      })

      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { description: 'New description' }
      })

      expect(updated.description).toBe('New description')
    })

    it('should update task due_date', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          status: TaskStatus.TODO
        }
      })

      const dueDate = new Date('2024-12-31')
      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { due_date: dueDate }
      })

      expect(updated.due_date).toEqual(dueDate)
    })

    it('should fail to update non-existent task', async () => {
      await expect(
        prisma.task.update({
          where: { id: 'non-existent-id' },
          data: { title: 'Updated Title' }
        })
      ).rejects.toThrow()
    })
  })

  describe('Task Deletion', () => {
    it('should delete task by id', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to delete',
          status: TaskStatus.TODO
        }
      })

      const deleted = await prisma.task.delete({
        where: { id: task.id }
      })

      expect(deleted.id).toBe(task.id)

      const found = await prisma.task.findUnique({
        where: { id: task.id }
      })
      expect(found).toBeNull()
    })

    it('should delete multiple tasks', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: TaskStatus.TODO },
          { title: 'Task 2', status: TaskStatus.TODO },
          { title: 'Task 3', status: TaskStatus.DONE }
        ]
      })

      const deletedCount = await prisma.task.deleteMany({
        where: { status: TaskStatus.TODO }
      })

      expect(deletedCount.count).toBe(2)

      const remaining = await prisma.task.findMany()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].title).toBe('Task 3')
    })
  })
})