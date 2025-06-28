# Task Creation Feature

## Purpose
Enable users to create new tasks with required and optional information.

## Input/Output Behavior

### Input
- **title**: string (required, 1-100 characters)
- **description**: string (optional, max 500 characters)  
- **due_date**: ISO date string (optional)

### Output
- Created task with auto-generated ID
- Timestamp for creation
- Default status: "todo"

## User Stories
- As a user, I want to create a task with just a title so I can quickly capture ideas
- As a user, I want to add a description and due date for detailed planning
- As a user, I want immediate feedback when task creation succeeds or fails

## Server Action Specification
- **Function**: `createTask(formData: FormData)`
- **Location**: `actions.ts` with `'use server'` directive
- **Input Validation**: Zod schema for { title, description?, due_date? }
- **Return**: Task object { id, title, description, status, due_date, created_at, updated_at }
- **Post-mutation**: `revalidatePath('/tasks')` to update cache

## UI Requirements
- Task creation form with title input (required)
- Optional description textarea
- Optional due date picker
- Submit button
- Success/error feedback

## Dependencies
- Task model definition
- Database schema for tasks table

## Edge Cases
- Empty title handling
- Title too long (>100 chars)
- Invalid date format
- Network failure during creation