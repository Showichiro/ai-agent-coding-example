# Task Data Model Specification

## Overview
The Task model represents a single task or todo item in the application. This specification defines the data structure, constraints, and relationships based on the requirements from task creation, management, and listing features.

## Core Fields

### Required Fields
- **id**: string (UUID/auto-generated primary key)
  - Unique identifier for each task
  - Auto-generated on creation
  - Immutable after creation

- **title**: string
  - Task title/summary
  - Required field (1-100 characters)
  - Cannot be empty or whitespace-only
  - Used for display and search

- **status**: enum
  - Current task state
  - Values: "todo" | "in_progress" | "done"
  - Default: "todo"
  - Required for filtering and progress tracking

- **created_at**: timestamp
  - ISO date string
  - Auto-generated on task creation
  - Immutable after creation
  - Used for sorting by creation date

- **updated_at**: timestamp
  - ISO date string
  - Auto-updated on any field modification
  - Used for tracking recent changes

### Optional Fields
- **description**: string
  - Detailed task description
  - Optional field (max 500 characters)
  - Can be null or empty
  - Supports rich text input

- **due_date**: timestamp
  - ISO date string
  - Optional deadline for task completion
  - Can be null (no deadline)
  - Used for sorting and filtering by due date

## Data Constraints

### Validation Rules
- **title**: 
  - Length: 1-100 characters
  - Cannot be null or empty
  - Trim whitespace before validation

- **description**:
  - Length: 0-500 characters
  - Can be null or empty
  - Trim whitespace

- **status**:
  - Must be one of: "todo", "in_progress", "done"
  - Case-sensitive exact match
  - Cannot be null

- **due_date**:
  - Must be valid ISO 8601 date string
  - Can be null (no deadline)
  - Should be future date (warning if past)

### Database Constraints
- **Primary Key**: id (UUID)
- **Not Null**: id, title, status, created_at, updated_at
- **Unique**: id
- **Indexes**: 
  - created_at (for sorting)
  - due_date (for filtering)
  - status (for filtering)

## Server Action Data Format

Server Actions in `actions.ts` work with the following TypeScript interfaces:

```typescript
// Input for createTask Server Action
interface CreateTaskInput {
  title: string;           // 1-100 characters, required
  description?: string;    // 0-500 characters, optional
  due_date?: string;       // ISO date string, optional
}

// Output from all Task Server Actions
interface TaskOutput {
  id: string;              // UUID auto-generated
  title: string;           // User-provided title
  description: string | null;  // User description or null
  status: "todo" | "in_progress" | "done";
  due_date: string | null;     // ISO date string or null
  created_at: string;          // ISO date string
  updated_at: string;          // ISO date string
}
```

## Database Schema (Prisma)

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  status      TaskStatus @default(TODO)
  due_date    DateTime?
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  @@index([created_at])
  @@index([due_date])
  @@index([status])
}

enum TaskStatus {
  TODO
  IN_PROGRESS  
  DONE
}
```

## Relationships
- **Current Version**: No relationships (standalone entity)
- **Future Considerations**: 
  - User ownership (user_id foreign key)
  - Categories/Tags (many-to-many)
  - Subtasks (self-referential hierarchy)

## Business Rules

### Creation Rules
- All tasks created with status "todo"
- Auto-generate id, created_at, updated_at
- Title is required, description and due_date optional

### Update Rules
- Any field except id and created_at can be modified
- updated_at automatically refreshed on changes
- Status transitions: any status → any status (no restrictions)

### Deletion Rules
- Hard delete (no soft delete requirements)
- Cascade delete if relationships added in future

## Feature Alignment

### Task Creation Compatibility
- ✅ Supports required title (1-100 chars)
- ✅ Supports optional description (max 500 chars)  
- ✅ Supports optional due_date (ISO format)
- ✅ Auto-generates id, timestamps
- ✅ Default status "todo"

### Task Management Compatibility
- ✅ Supports editing title, description, due_date
- ✅ Supports status changes (todo|in_progress|done)
- ✅ Supports deletion by id
- ✅ Updated_at tracking for changes

### Task Listing Compatibility
- ✅ Supports status filtering (todo|in_progress|done|all)
- ✅ Supports sorting by created_at, due_date, title, status
- ✅ Includes all fields needed for display
- ✅ Optimized with database indexes

## Edge Case Handling
- **Empty title**: Validation error before database
- **Title too long**: Validation error (>100 chars)
- **Invalid status**: Validation error 
- **Invalid date format**: Validation error
- **Null vs empty description**: Both allowed, treated as no description
- **Past due dates**: Allowed with warning