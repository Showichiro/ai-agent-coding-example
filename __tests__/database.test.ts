import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Disable Prisma mocking for this test file
vi.mock('@prisma/client', async () => {
  const actual = await vi.importActual('@prisma/client');
  return actual;
});

vi.mock('../lib/prisma', async () => {
  const actual = await vi.importActual('../lib/prisma');
  return actual;
});

const { PrismaClient } = await import('@prisma/client');

// Database connection and schema tests
describe('Database Connection', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./test.db'
        }
      }
    });
    // Ensure we start with a clean state
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  it('should connect to database successfully', async () => {
    // This test will fail initially as database is not set up
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should have Task table with correct schema', async () => {
    // This will fail until Task model is properly implemented
    const taskCount = await prisma.task.count();
    expect(typeof taskCount).toBe('number');
  });

  it('should have TaskStatus enum available', async () => {
    // This will fail until enum is implemented
    const { TaskStatus } = await import('@prisma/client');
    expect(TaskStatus.TODO).toBe('TODO');
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(TaskStatus.DONE).toBe('DONE');
  });

  it('should create a task with all required fields', async () => {
    // This will fail until schema is properly implemented
    const newTask = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        dueDate: new Date('2024-12-31'),
      }
    });

    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Test Task');
    expect(newTask.status).toBe('TODO');
    expect(newTask.createdAt).toBeDefined();
    expect(newTask.updatedAt).toBeDefined();
  });
});