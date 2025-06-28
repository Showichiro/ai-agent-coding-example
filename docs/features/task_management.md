# Task Management Feature

## Purpose
Allow users to view, edit, delete, and change status of existing tasks.

## Input/Output Behavior

### Task Editing
- **Input**: Task ID + updated fields (title, description, due_date)
- **Output**: Updated task object

### Task Deletion
- **Input**: Task ID
- **Output**: Confirmation of deletion

### Status Change
- **Input**: Task ID + new status ("todo" | "in_progress" | "done")
- **Output**: Task with updated status

## User Stories
- As a user, I want to edit task details to keep information current
- As a user, I want to mark tasks as complete when finished
- As a user, I want to delete tasks that are no longer needed
- As a user, I want to change task status to track progress

## Server Action Specification
- **Update Function**: `updateTask(id: string, formData: FormData)`
- **Delete Function**: `deleteTask(id: string)`
- **Status Function**: `updateTaskStatus(id: string, status: TaskStatus)`
- **Location**: `actions.ts` with `'use server'` directive
- **Input Validation**: Zod schemas for each operation
- **Post-mutation**: `revalidatePath('/tasks')` to update cache

## UI Requirements
- Edit button on each task
- Delete confirmation dialog
- Status toggle buttons/dropdown
- Inline editing capability
- Undo functionality for accidental changes

## Dependencies
- Task model definition
- Task list display
- Authentication (user owns task)

## Edge Cases
- Task not found (404)
- Unauthorized edit attempt
- Concurrent edits by multiple sessions
- Network interruption during save