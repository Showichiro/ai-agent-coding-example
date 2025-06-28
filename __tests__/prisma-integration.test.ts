import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Prisma Integration Test', () => {
  describe('Real Prisma Client (Node.js)', () => {
    it('should work with real Prisma client in Node.js environment', async () => {
      // Temporarily unmock Prisma to test real functionality
      vi.doUnmock('@prisma/client')
      
      try {
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: 'file:./test.db'
            }
          }
        })
        
        // Test connection
        await prisma.$connect()
        
        // Test basic operation
        const result = await prisma.$queryRaw`SELECT 1 as test`
        expect(result).toBeDefined()
        
        await prisma.$disconnect()
      } catch (error) {
        console.error('Real Prisma test failed:', error)
        throw error
      }
    })
  })

  describe('Mocked Prisma Client (Vitest)', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should work with mocked Prisma client', async () => {
      // Re-mock Prisma after real test
      vi.doMock('@prisma/client', () => {
        const mockPrisma = {
          task: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteMany: vi.fn(),
          },
          $connect: vi.fn(),
          $disconnect: vi.fn(),
        }
        
        return {
          PrismaClient: vi.fn(() => mockPrisma),
          Prisma: {
            TaskStatus: {
              TODO: 'TODO',
              IN_PROGRESS: 'IN_PROGRESS', 
              DONE: 'DONE'
            }
          }
        }
      })

      const { prisma } = await import('../lib/prisma')
      
      // Mock return value
      const mockTask = {
        id: 'test-id',
        title: 'Test Task',
        status: 'TODO',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      vi.mocked(prisma.task.create).mockResolvedValue(mockTask)
      
      // Test mocked functionality
      const result = await prisma.task.create({
        data: {
          title: 'Test Task',
          status: 'TODO'
        }
      })
      
      expect(result).toEqual(mockTask)
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          status: 'TODO'
        }
      })
    })

    it('should handle async/await properly with mocked Prisma', async () => {
      const { prisma } = await import('../lib/prisma')
      
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'TODO' },
        { id: '2', title: 'Task 2', status: 'DONE' }
      ]
      
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks)
      
      const tasks = await prisma.task.findMany()
      
      expect(tasks).toHaveLength(2)
      expect(tasks[0].title).toBe('Task 1')
      expect(prisma.task.findMany).toHaveBeenCalled()
    })

    it('should handle Prisma errors properly', async () => {
      const { prisma } = await import('../lib/prisma')
      
      const mockError = new Error('Database connection failed')
      vi.mocked(prisma.task.create).mockRejectedValue(mockError)
      
      await expect(
        prisma.task.create({
          data: { title: 'Test', status: 'TODO' }
        })
      ).rejects.toThrow('Database connection failed')
    })
  })

  describe('Environment Configuration', () => {
    it('should have correct DATABASE_URL in test environment', () => {
      expect(process.env.DATABASE_URL).toBe('file:./test.db')
      expect(process.env.NODE_ENV).toBe('test')
    })

    it('should handle global Prisma instance correctly', async () => {
      const { prisma } = await import('../lib/prisma')
      expect(prisma).toBeDefined()
      expect(typeof prisma.$connect).toBe('function')
      expect(typeof prisma.$disconnect).toBe('function')
    })
  })
})