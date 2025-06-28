import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock Next.js Server Actions environment
global.FormData = FormData
global.Request = Request
global.Response = Response
global.Headers = Headers

// Mock Prisma for testing - CONDITIONAL MOCKING
const shouldMockPrisma = process.env.VITEST_MOCK_PRISMA !== 'false'

if (shouldMockPrisma) {
  vi.mock('@prisma/client', () => {
    const mockPrisma = {
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
    
    return {
      PrismaClient: vi.fn(() => mockPrisma),
      Prisma: {
        TaskStatus: {
          TODO: 'TODO',
          IN_PROGRESS: 'IN_PROGRESS', 
          DONE: 'DONE'
        }
      },
      TaskStatus: {
        TODO: 'TODO',
        IN_PROGRESS: 'IN_PROGRESS', 
        DONE: 'DONE'
      }
    }
  })

  // Mock our lib/prisma wrapper
  vi.mock('../lib/prisma', () => {
    const mockPrisma = {
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
    
    return { prisma: mockPrisma }
  })
}

// Mock Next.js revalidation functions with proper test environment setup
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(() => {}),
  revalidateTag: vi.fn(() => {}),
}))

// Mock Next.js static generation store for revalidation
Object.defineProperty(globalThis, 'AsyncLocalStorage', {
  value: class MockAsyncLocalStorage {
    getStore() {
      return { isStaticGeneration: false }
    }
    run(store: any, callback: () => any) {
      return callback()
    }
  }
})

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})