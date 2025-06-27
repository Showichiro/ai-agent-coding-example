# Task Management Feature Specification

## Overview
This document specifies the task management feature that enables CRUD operations for tasks with core fields: title, description, status, and due_date.

## Data Model

### Task Entity
```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  due_date?: string
  created_at: string
  updated_at: string
}

type TaskStatus = "todo" | "in_progress" | "done"
```

### Field Specifications
- **title**: Required string field containing the task name
- **description**: Optional string field for additional task details
- **status**: Required enum field with three states:
  - `"todo"`: Initial state for new tasks
  - `"in_progress"`: Active working state
  - `"done"`: Completed state  
- **due_date**: Optional ISO date string for task deadline
- **created_at**: Auto-generated timestamp for task creation
- **updated_at**: Auto-generated timestamp for last modification

## Core Operations

### Create Task
- **Operation**: POST /api/tasks
- **Required**: `title`, `status` (defaults to "todo")
- **Optional**: `description`, `due_date`
- **Response**: Created task object with generated ID and timestamps

### Read Tasks
- **Operation**: GET /api/tasks
- **Query Parameters**:
  - `sort`: "created_at" | "due_date" (default: "created_at")
  - `order`: "asc" | "desc" (default: "desc")
- **Response**: Array of task objects sorted by specified criteria

### Update Task
- **Operation**: PUT /api/tasks/:id
- **Allowed Updates**: `title`, `description`, `status`, `due_date`
- **Response**: Updated task object with new `updated_at` timestamp

### Delete Task
- **Operation**: DELETE /api/tasks/:id
- **Response**: Success confirmation

## Status Management

### Status Transitions
- `todo` → `in_progress`: Start working on task
- `in_progress` → `done`: Complete task
- `done` → `todo`: Reopen completed task
- `in_progress` → `todo`: Pause active task

### Quick Status Actions
- Mark as complete: Direct transition to "done" status
- Reopen task: Direct transition from "done" to "todo"

## Sorting Options

### By Creation Date
- Default sorting method
- Orders tasks by `created_at` timestamp
- Most recent tasks appear first (desc order)

### By Due Date
- Alternative sorting method
- Orders tasks by `due_date` field
- Tasks without due dates appear last
- Nearest deadlines appear first (asc order)

## Validation Rules

### Title Validation
- Required field
- Minimum length: 1 character
- Maximum length: 255 characters
- No leading/trailing whitespace

### Description Validation
- Optional field
- Maximum length: 2000 characters

### Status Validation
- Must be one of: "todo", "in_progress", "done"
- Required field for all operations

### Due Date Validation
- Must be valid ISO 8601 date string format
- Cannot be in the past for new tasks
- Optional field

## Error Handling

### Validation Errors
- 400 Bad Request for invalid field values
- Clear error messages indicating specific validation failures

### Not Found Errors
- 404 Not Found for non-existent task IDs

### Server Errors
- 500 Internal Server Error for database or system failures
- Graceful error recovery with user-friendly messages

## Success Criteria
1. All CRUD operations function correctly
2. Task status transitions work as specified
3. Sorting options return correctly ordered results
4. Validation rules prevent invalid data
5. Error handling provides clear feedback
6. Performance remains acceptable with large task lists