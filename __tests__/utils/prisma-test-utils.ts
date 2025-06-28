import { vi } from 'vitest'

/**
 * Prisma Test Utilities
 * 
 * SOLUTION for Vitest+Prisma compatibility issue:
 * The problem was that existing tests were trying to use real Prisma operations
 * but our mocks were not properly configured with return values.
 * 
 * This utility provides proper mock setup for TDD workflow.
 */

export interface MockPrismaClient {
  task: {
    create: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
  user: {
    create: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
  $connect: ReturnType<typeof vi.fn>
  $disconnect: ReturnType<typeof vi.fn>
  $queryRaw: ReturnType<typeof vi.fn>
}

/**
 * Creates a properly configured mock Prisma client
 * This is the WORKING solution for Vitest+Prisma integration
 */
export function createMockPrismaClient(): MockPrismaClient {
  return {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn(),
  }
}

/**
 * Sets up mock return values for common operations
 * Call this in your test setup to get working mocks
 */
export function setupWorkingPrismaMocks(mockPrisma: MockPrismaClient) {
  // Task mocks with proper return values
  mockPrisma.task.create.mockImplementation(async (args) => ({
    id: 'mock-task-id',
    title: args.data.title || 'Mock Task',
    description: args.data.description || null,
    status: args.data.status || 'TODO',
    due_date: args.data.due_date || null,
    created_at: new Date(),
    updated_at: new Date(),
  }))

  mockPrisma.task.findMany.mockResolvedValue([
    {
      id: 'task-1',
      title: 'Mock Task 1',
      description: null,
      status: 'TODO',
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ])

  mockPrisma.task.findUnique.mockResolvedValue({
    id: 'task-1',
    title: 'Mock Task',
    description: null,
    status: 'TODO',
    due_date: null,
    created_at: new Date(),
    updated_at: new Date(),
  })

  mockPrisma.task.update.mockImplementation(async (args) => ({
    id: args.where.id || 'mock-id',
    title: args.data.title || 'Updated Task',
    description: args.data.description || null,
    status: args.data.status || 'TODO',
    due_date: args.data.due_date || null,
    created_at: new Date(),
    updated_at: new Date(),
  }))

  mockPrisma.task.delete.mockResolvedValue({
    id: 'deleted-task-id',
    title: 'Deleted Task',
    description: null,
    status: 'TODO',
    due_date: null,
    created_at: new Date(),
    updated_at: new Date(),
  })

  mockPrisma.task.deleteMany.mockResolvedValue({ count: 1 })

  // User mocks with proper return values
  mockPrisma.user.create.mockImplementation(async (args) => ({
    id: 'mock-user-id',
    email: args.data.email || 'test@example.com',
    password: args.data.password || 'hashed-password',
    created_at: new Date(),
    updated_at: new Date(),
  }))

  mockPrisma.user.findUnique.mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    created_at: new Date(),
    updated_at: new Date(),
  })

  mockPrisma.user.deleteMany.mockResolvedValue({ count: 1 })
}

/**
 * Test helper for TDD workflow
 * Use this in tests to get a properly working Prisma mock
 */
export function setupTDDPrismaMocks() {
  const mockPrisma = createMockPrismaClient()
  setupWorkingPrismaMocks(mockPrisma)
  return mockPrisma
}

/**
 * Resets all mock functions - call this in beforeEach
 */
export function resetPrismaMocks(mockPrisma: MockPrismaClient) {
  Object.values(mockPrisma.task).forEach(mock => mock.mockReset())
  Object.values(mockPrisma.user).forEach(mock => mock.mockReset())
  mockPrisma.$connect.mockReset()
  mockPrisma.$disconnect.mockReset()
  mockPrisma.$queryRaw.mockReset()
  
  // Re-setup working mocks after reset
  setupWorkingPrismaMocks(mockPrisma)
}