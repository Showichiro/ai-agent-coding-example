import { vi } from 'vitest'

/**
 * Test utilities for Server Actions and Database mocking
 * Following TDD + Tidy First methodology from docs/rules/implementation_rules.md
 */

// Mock Prisma instance for testing
export const mockPrisma = {
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
  $connect: vi.fn(),
  $disconnect: vi.fn(),
}

// Mock FormData for Server Actions testing
export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

// Test data factories following docs/model/task.md specification
export const createTestTask = (overrides = {}) => ({
  id: 'test-task-id',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo' as const,
  due_date: new Date('2025-12-31'),
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
})

export const createTestTaskInput = (overrides = {}) => ({
  title: 'Test Task',
  description: 'Test description',
  due_date: '2025-12-31T00:00:00.000Z',
  ...overrides,
})

// Mock Next.js cache functions
export const mockRevalidatePath = vi.fn()
export const mockRevalidateTag = vi.fn()

// Mock Server Action response helpers
export const createMockServerActionResponse = (data: any, error?: string) => {
  if (error) {
    return { success: false, error, data: null }
  }
  return { success: true, error: null, data }
}

// Test setup helpers
export const setupDatabaseMocks = () => {
  // Reset all mocks
  Object.values(mockPrisma.task).forEach(mock => mock.mockReset())
  Object.values(mockPrisma.user).forEach(mock => mock.mockReset())
  mockPrisma.$connect.mockReset()
  mockPrisma.$disconnect.mockReset()
}

export const setupServerActionMocks = () => {
  mockRevalidatePath.mockReset()
  mockRevalidateTag.mockReset()
}

// AAA Pattern helper for TDD tests
export const createTestCase = <T, R>(
  description: string,
  arrange: () => T,
  act: (input: T) => Promise<R> | R,
  assert: (result: R, input: T) => void | Promise<void>
) => ({
  description,
  arrange,
  act,
  assert,
})

// Validation helpers for Zod schema testing
export const expectValidationError = (result: any, field: string) => {
  expect(result.success).toBe(false)
  expect(result.error.issues.some((issue: any) => 
    issue.path.includes(field)
  )).toBe(true)
}

export const expectValidationSuccess = (result: any) => {
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
}