import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../lib/prisma'

describe('Database Connection and Models', () => {
  afterEach(async () => {
    // Clean up database after each test
    await prisma.task.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('User Model', () => {
    it('should create a user with email and password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        name: 'Test User'
      }

      const user = await prisma.user.create({
        data: userData
      })

      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.password).toBe(userData.password)
      expect(user.name).toBe(userData.name)
      expect(user.createdAt).toBeDefined()
      expect(user.updatedAt).toBeDefined()
    })

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      }

      await prisma.user.create({ data: userData })

      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow()
    })
  })

  describe('Task Model', () => {
    let testUser: any

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: 'taskuser@example.com',
          password: 'password123'
        }
      })
    })

    it('should create a task with required fields', async () => {
      const taskData = {
        title: 'Test Task',
        userId: testUser.id
      }

      const task = await prisma.task.create({
        data: taskData
      })

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.title).toBe(taskData.title)
      expect(task.status).toBe('todo')
      expect(task.userId).toBe(testUser.id)
      expect(task.description).toBeNull()
      expect(task.dueDate).toBeNull()
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    it('should create a task with all optional fields', async () => {
      const dueDate = new Date('2025-12-31')
      const taskData = {
        title: 'Complete Task',
        description: 'Task with all fields',
        status: 'in_progress',
        dueDate,
        userId: testUser.id
      }

      const task = await prisma.task.create({
        data: taskData
      })

      expect(task.title).toBe(taskData.title)
      expect(task.description).toBe(taskData.description)
      expect(task.status).toBe(taskData.status)
      expect(task.dueDate).toEqual(dueDate)
      expect(task.userId).toBe(testUser.id)
    })

    it('should cascade delete tasks when user is deleted', async () => {
      await prisma.task.create({
        data: {
          title: 'Task to be deleted',
          userId: testUser.id
        }
      })

      await prisma.user.delete({
        where: { id: testUser.id }
      })

      const tasks = await prisma.task.findMany({
        where: { userId: testUser.id }
      })

      expect(tasks).toHaveLength(0)
    })
  })

  describe('Database Relations', () => {
    it('should fetch user with their tasks', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'relateduser@example.com',
          password: 'password123'
        }
      })

      await prisma.task.createMany({
        data: [
          { title: 'Task 1', userId: user.id },
          { title: 'Task 2', userId: user.id, status: 'done' }
        ]
      })

      const userWithTasks = await prisma.user.findUnique({
        where: { id: user.id },
        include: { tasks: true }
      })

      expect(userWithTasks).toBeDefined()
      expect(userWithTasks?.tasks).toHaveLength(2)
      expect(userWithTasks?.tasks[0].title).toBe('Task 1')
      expect(userWithTasks?.tasks[1].status).toBe('done')
    })
  })
})