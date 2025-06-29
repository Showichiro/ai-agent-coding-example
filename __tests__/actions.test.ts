import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionState } from '../types/task';

// Disable Prisma mocking for this test file to use real database
vi.mock('@prisma/client', async () => {
  const actual = await vi.importActual('@prisma/client');
  return actual;
});

vi.mock('../lib/prisma', async () => {
  const actual = await vi.importActual('../lib/prisma');
  return actual;
});

// Mock next/cache for revalidation testing
const mockRevalidatePath = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

describe('createTask Server Action', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Clean up the database before each test
    const { prisma } = await import('../lib/prisma');
    await prisma.task.deleteMany();
  });

  it('should create a task successfully with valid data', async () => {
    // This will fail until createTask is implemented
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Test Task');
    formData.append('description', 'Test Description');
    formData.append('dueDate', '2024-12-31T12:00:00.000Z');

    const result = await createTask(null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('タスクを作成しました');
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe('Test Task');
    expect(result.data.status).toBe('TODO');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/');
  });

  it('should fail validation with empty title', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', ''); // Empty title
    formData.append('description', 'Test Description');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors).toBeDefined();
    expect(result.errors?.title).toContain('必須入力');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should fail validation with title too long', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'a'.repeat(201)); // Too long title
    formData.append('description', 'Test Description');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.title).toContain('200文字以内');
  });

  it('should fail validation with description too long', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('description', 'a'.repeat(1001)); // Too long description

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.description).toContain('1000文字以内');
  });

  it('should fail validation with invalid dueDate', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('dueDate', 'invalid-date');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.dueDate).toContain('有効な日時');
  });

  it('should create task with optional fields missing', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Minimal Task');
    // No description or dueDate

    const result = await createTask(null, formData);

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Minimal Task');
    expect(result.data.description).toBeNull();
    expect(result.data.dueDate).toBeNull();
    expect(result.data.status).toBe('TODO');
  });

  it('should enforce maximum task limit', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    const { prisma } = await import('../lib/prisma');
    
    // Mock task count to be at limit
    vi.spyOn(prisma.task, 'count').mockResolvedValue(100);
    
    const formData = new FormData();
    formData.append('title', 'Over Limit Task');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('タスクは最大100件まで作成できます');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should set correct default values', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Default Values Test');

    const result = await createTask(null, formData);

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('TODO');
    expect(result.data.createdAt).toBeDefined();
    expect(result.data.updatedAt).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(typeof result.data.id).toBe('string');
  });

  it('should handle database errors gracefully', async () => {
    const { createTask } = await import('../app/actions/task-actions');
    const { prisma } = await import('../lib/prisma');
    
    // Mock count to return 0 (under limit) but create to fail
    const countSpy = vi.spyOn(prisma.task, 'count').mockResolvedValue(0);
    const createSpy = vi.spyOn(prisma.task, 'create').mockRejectedValue(new Error('Database error'));
    
    const formData = new FormData();
    formData.append('title', 'Error Task');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('タスクの作成に失敗しました');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    
    // Restore mocks immediately
    countSpy.mockRestore();
    createSpy.mockRestore();
  });
});

describe('getTasks Server Action', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Clean up the database and create test data
    const { prisma } = await import('../lib/prisma');
    await prisma.task.deleteMany();
    
    // Create test tasks with different statuses and dates
    await prisma.task.createMany({
      data: [
        {
          id: 'task-1',
          title: 'TODO Task 1',
          description: 'First todo task',
          status: 'TODO',
          dueDate: new Date('2024-12-31'),
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'task-2',
          title: 'In Progress Task',
          description: 'Work in progress',
          status: 'IN_PROGRESS',
          dueDate: new Date('2024-11-15'),
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'task-3',
          title: 'Done Task',
          description: 'Completed task',
          status: 'DONE',
          dueDate: null,
          createdAt: new Date('2024-01-03'),
        },
        {
          id: 'task-4',
          title: 'TODO Task 2',
          description: 'Second todo task',
          status: 'TODO',
          dueDate: new Date('2024-10-01'),
          createdAt: new Date('2024-01-04'),
        },
      ],
    });
  });

  it('should return all tasks with default options', async () => {
    // This will fail until getTasks is implemented
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks();

    expect(result.tasks).toHaveLength(4);
    expect(result.count).toBe(4);
    expect(result.hasMore).toBe(false);
    
    // Should be sorted by createdAt desc by default
    expect(result.tasks[0].title).toBe('TODO Task 2'); // Most recent
    expect(result.tasks[3].title).toBe('TODO Task 1'); // Oldest
  });

  it('should filter tasks by status', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const todoResult = await getTasks({ statusFilter: 'TODO' });
    expect(todoResult.tasks).toHaveLength(2);
    expect(todoResult.tasks.every(task => task.status === 'TODO')).toBe(true);
    
    const inProgressResult = await getTasks({ statusFilter: 'IN_PROGRESS' });
    expect(inProgressResult.tasks).toHaveLength(1);
    expect(inProgressResult.tasks[0].status).toBe('IN_PROGRESS');
    
    const doneResult = await getTasks({ statusFilter: 'DONE' });
    expect(doneResult.tasks).toHaveLength(1);
    expect(doneResult.tasks[0].status).toBe('DONE');
  });

  it('should sort tasks by created_at in ascending order', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks({ 
      sortBy: 'created_at', 
      sortOrder: 'asc' 
    });

    expect(result.tasks).toHaveLength(4);
    expect(result.tasks[0].title).toBe('TODO Task 1'); // Oldest first
    expect(result.tasks[3].title).toBe('TODO Task 2'); // Newest last
  });

  it('should sort tasks by due_date in descending order', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks({ 
      sortBy: 'due_date', 
      sortOrder: 'desc' 
    });

    expect(result.tasks).toHaveLength(4);
    // Tasks with null dueDate should come last when sorting desc
    expect(result.tasks[0].dueDate).not.toBeNull();
    expect(result.tasks[3].dueDate).toBeNull(); // null dueDate task last
  });

  it('should sort tasks by due_date in ascending order', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks({ 
      sortBy: 'due_date', 
      sortOrder: 'asc' 
    });

    expect(result.tasks).toHaveLength(4);
    // Tasks with null dueDate should come first when sorting asc
    expect(result.tasks[0].dueDate).toBeNull(); // null dueDate task first
    expect(result.tasks[3].dueDate).not.toBeNull();
  });

  it('should support pagination with limit and offset', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const firstPage = await getTasks({ 
      limit: 2, 
      offset: 0,
      sortBy: 'created_at',
      sortOrder: 'asc'
    });

    expect(firstPage.tasks).toHaveLength(2);
    expect(firstPage.count).toBe(4); // Total count
    expect(firstPage.hasMore).toBe(true);
    expect(firstPage.tasks[0].title).toBe('TODO Task 1');
    expect(firstPage.tasks[1].title).toBe('In Progress Task');

    const secondPage = await getTasks({ 
      limit: 2, 
      offset: 2,
      sortBy: 'created_at',
      sortOrder: 'asc'
    });

    expect(secondPage.tasks).toHaveLength(2);
    expect(secondPage.count).toBe(4); // Total count
    expect(secondPage.hasMore).toBe(false);
    expect(secondPage.tasks[0].title).toBe('Done Task');
    expect(secondPage.tasks[1].title).toBe('TODO Task 2');
  });

  it('should combine filtering and sorting', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks({
      statusFilter: 'TODO',
      sortBy: 'due_date',
      sortOrder: 'asc'
    });

    expect(result.tasks).toHaveLength(2);
    expect(result.tasks.every(task => task.status === 'TODO')).toBe(true);
    // Should be sorted by dueDate ascending
    expect(new Date(result.tasks[0].dueDate!).getTime()).toBeLessThan(
      new Date(result.tasks[1].dueDate!).getTime()
    );
  });

  it('should enforce maximum limit of 100', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    // Test that limits over 100 throw an error
    await expect(getTasks({ limit: 150 })).rejects.toThrow('タスクの取得に失敗しました');
    
    // Test that limit of 100 works fine
    const result = await getTasks({ limit: 100 });
    expect(result.tasks).toHaveLength(4); // We only have 4 test tasks
  });

  it('should handle empty results', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    const result = await getTasks({ statusFilter: 'IN_PROGRESS', offset: 10 });
    
    expect(result.tasks).toHaveLength(0);
    expect(result.count).toBe(1); // Total IN_PROGRESS tasks
    expect(result.hasMore).toBe(false);
  });

  it('should validate input options with defaults', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    
    // Test with invalid/missing options - should use defaults
    const result = await getTasks({});
    
    expect(result.tasks).toHaveLength(4);
    expect(result.count).toBe(4);
    // Default sort should be createdAt desc
    expect(result.tasks[0].createdAt.getTime()).toBeGreaterThan(
      result.tasks[1].createdAt.getTime()
    );
  });

  it('should handle database errors gracefully', async () => {
    const { getTasks } = await import('../app/actions/task-actions');
    const { prisma } = await import('../lib/prisma');
    
    // Mock database error
    const findManySpy = vi.spyOn(prisma.task, 'findMany').mockRejectedValue(new Error('Database error'));
    
    await expect(getTasks()).rejects.toThrow('タスクの取得に失敗しました');
    
    findManySpy.mockRestore();
  });
});

describe('updateTask Server Action', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Clean up the database and create test data
    const { prisma } = await import('../lib/prisma');
    await prisma.task.deleteMany();
    
    // Create a test task to update
    await prisma.task.create({
      data: {
        id: 'update-task-1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'TODO',
        dueDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
      },
    });
  });

  it('should update task successfully with valid data', async () => {
    // This will fail until updateTask is implemented
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Updated Title');
    formData.append('description', 'Updated Description');
    formData.append('dueDate', '2025-01-15T12:00:00.000Z');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('タスクを更新しました');
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe('Updated Title');
    expect(result.data.description).toBe('Updated Description');
    expect(result.data.status).toBe('TODO'); // Should remain unchanged
  });

  it('should update only specified fields (partial update)', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Only Title Updated');
    // No description or dueDate

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Only Title Updated');
    expect(result.data.description).toBe('Original Description'); // Unchanged
    expect(result.data.dueDate).toEqual(new Date('2024-12-31')); // Unchanged
  });

  it('should handle empty values correctly', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Updated Title');
    formData.append('description', ''); // Empty string should clear description
    formData.append('dueDate', ''); // Empty string should clear dueDate

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Updated Title');
    expect(result.data.description).toBeNull();
    expect(result.data.dueDate).toBeNull();
  });

  it('should fail validation with empty title', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', ''); // Empty title
    formData.append('description', 'Valid Description');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.title).toContain('必須入力');
  });

  it('should fail validation with title too long', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'a'.repeat(201)); // Too long title
    formData.append('description', 'Valid Description');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.title).toContain('200文字以内');
  });

  it('should fail validation with description too long', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('description', 'a'.repeat(1001)); // Too long description

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.description).toContain('1000文字以内');
  });

  it('should fail validation with invalid dueDate', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');
    formData.append('dueDate', 'invalid-date');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('バリデーションエラー');
    expect(result.errors?.dueDate).toContain('有効な日時');
  });

  it('should fail with invalid taskId', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');

    const result = await updateTask('', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('無効なタスクIDです');
  });

  it('should fail when task does not exist', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Valid Title');

    const result = await updateTask('non-existent-task', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('タスクが見つかりません');
  });

  it('should handle database errors gracefully', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    const { prisma } = await import('../lib/prisma');
    
    // Mock findUnique to succeed but update to fail
    vi.spyOn(prisma.task, 'findUnique').mockResolvedValue({
      id: 'update-task-1',
      title: 'Original Title',
      description: 'Original Description',
      status: 'TODO',
      dueDate: new Date('2024-12-31'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    vi.spyOn(prisma.task, 'update').mockRejectedValue(new Error('Database error'));
    
    const formData = new FormData();
    formData.append('title', 'Updated Title');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('タスクの更新に失敗しました');
  });

  it('should update updatedAt timestamp', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('title', 'Updated Title');

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(true);
    expect(result.data.updatedAt).toBeDefined();
    // updatedAt should be more recent than createdAt
    expect(result.data.updatedAt.getTime()).toBeGreaterThan(
      result.data.createdAt.getTime()
    );
  });

  it('should preserve unchanged fields', async () => {
    const { updateTask } = await import('../app/actions/task-actions');
    
    const formData = new FormData();
    formData.append('description', 'Only description changed');
    // No title or dueDate

    const result = await updateTask('update-task-1', null, formData);

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Original Title'); // Preserved
    expect(result.data.description).toBe('Only description changed');
    expect(result.data.dueDate).toEqual(new Date('2024-12-31')); // Preserved
    expect(result.data.id).toBe('update-task-1'); // Preserved
    expect(result.data.status).toBe('TODO'); // Preserved
  });
});