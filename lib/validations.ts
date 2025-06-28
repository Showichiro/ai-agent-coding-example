import { z } from 'zod';

// Task creation validation schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1, '必須入力').max(200, '200文字以内'),
  description: z.string().max(1000, '1000文字以内').optional(),
  dueDate: z.string().datetime('有効な日時').optional(),
});

// Task update validation schema (all fields optional)
export const UpdateTaskSchema = CreateTaskSchema.partial();

// Task status validation schema
export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

// Get tasks options validation schema
export const GetTasksSchema = z.object({
  sortBy: z.enum(['created_at', 'due_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  statusFilter: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'all']).default('all'),
  limit: z.number().min(1).max(100).default(100),
  offset: z.number().min(0).default(0),
});

// Task ID validation schema
export const TaskIdSchema = z.string().min(1, '無効なタスクIDです');

// Form data validation helpers
export const parseFormData = (formData: FormData) => {
  return {
    title: formData.get('title') as string || undefined,
    description: formData.get('description') as string || undefined,
    dueDate: formData.get('dueDate') as string || undefined,
  };
};

// Validation result type
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

// Generic validation function
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
}