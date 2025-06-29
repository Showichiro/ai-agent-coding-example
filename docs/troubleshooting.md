# Troubleshooting Guide

This document records technical issues encountered in the project and their solutions to prevent recurrence and enable quick problem resolution.

## Table of Contents
- [Authentication](#authentication)
- [Test Environment](#test-environment)
- [Prisma](#prisma)
- [Next.js](#nextjs)

---

## Authentication

### Issue 1: Complex Authentication State Testing
**Symptoms**: Mock setup becomes cumbersome when testing components that require authentication

**Cause**: Next-Auth session management depends on multiple components

**Solution**:
```typescript
// Create test utility
export const mockSession = (user?: Partial<User>) => {
  return {
    user: user || { id: '1', email: 'test@example.com' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
};

// Usage example in tests
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession(), status: 'authenticated' })
}));
```

**Reference**: `__tests__/utils/test-helpers.ts`

---

## Test Environment

### Issue 2: Vitest and Prisma Compatibility Issues
**Symptoms**: Prisma client doesn't work correctly in test environment

**Cause**: Conflict between Vitest environment and Prisma global instance

**Solution**:
1. Isolate test Prisma client
```typescript
// lib/prisma.test.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_TEST_URL
    }
  }
});

export default prisma;
```

2. Test environment setup
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    poolOptions: {
      threads: {
        singleThread: true // Prevent Prisma conflicts
      }
    }
  }
});
```

**Reference**: `__tests__/setup/vitest-environment.test.ts`

---

## Prisma

### Issue 3: Migration Execution Errors
**Symptoms**: Error occurs when running `npx prisma migrate dev`

**Cause**: Database file lock or permission issues

**Solution**:
```bash
# Delete and recreate database files
rm prisma/dev.db
rm prisma/dev.db-journal
npx prisma migrate dev --name init

# For permission issues
chmod 644 prisma/dev.db
```

---

## Next.js

### Issue 4: Server Actions Type Errors
**Symptoms**: TypeScript type errors when using Server Actions

**Cause**: Improper type definition for Server Actions return values

**Solution**:
```typescript
// Correct type definition
export async function createTask(formData: FormData): Promise<void> {
  'use server';
  
  // Always use try-catch before revalidatePath()
  try {
    await prisma.task.create({ data: {...} });
    revalidatePath('/');
  } catch (error) {
    console.error('Task creation failed:', error);
    throw new Error('Failed to create task');
  }
}
```

**Note**: Server Actions must always be defined as `async` functions with proper error handling

---

## Template for Adding New Issues

### Issue X: [Brief description of the issue]
**Symptoms**: [Specific phenomena observed by users]

**Cause**: [Technical explanation of the cause]

**Solution**:
```[language]
// Specific code example
```

**Reference**: [Links to related files or documentation]

---

Last updated: 2025-06-28