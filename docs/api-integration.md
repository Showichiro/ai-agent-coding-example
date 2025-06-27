# API Integration Guide

This document provides comprehensive guidance for integrating with the Todo Application's REST API, including authentication, error handling, and best practices.

## Overview

The Todo Application provides a RESTful API for managing tasks and user authentication. The API is designed to be type-safe, secure, and easy to integrate with frontend applications.

## API Client Library

### Installation and Setup

The API client is located at `lib/api-client.ts` and provides a comprehensive interface for all API operations.

```typescript
import { api, apiClient, handleApiError } from '../lib/api-client'
```

### Basic Usage

```typescript
// Using the singleton API instance (recommended)
import { api } from '../lib/api-client'

// Authentication
await api.auth.login({ email: 'user@example.com', password: 'password' })

// Task operations
const tasks = await api.tasks.list()
const newTask = await api.tasks.create({ title: 'New Task' })
```

### Advanced Configuration

```typescript
import { ApiClient } from '../lib/api-client'

const customClient = new ApiClient({
  baseUrl: 'https://api.example.com',
  timeout: 15000,
  defaultHeaders: {
    'X-Client-Version': '1.0.0'
  },
  onAuthRequired: () => {
    // Custom auth required handler
    router.push('/login')
  },
  onTokenRefresh: (tokens) => {
    // Custom token storage
    secureStorage.setItem('tokens', JSON.stringify(tokens))
  }
})
```

## Authentication

### Login Flow

```typescript
import { api, handleApiError } from '../lib/api-client'

async function login(email: string, password: string) {
  try {
    const response = await api.auth.login({ email, password })
    console.log('Logged in:', response.user)
    return response
  } catch (error) {
    const errorMessage = handleApiError(error)
    console.error('Login failed:', errorMessage)
    throw new Error(errorMessage)
  }
}
```

### Registration Flow

```typescript
async function register(email: string, password: string) {
  try {
    const response = await api.auth.register({ email, password })
    console.log('Registered:', response.user)
    return response
  } catch (error) {
    const errorMessage = handleApiError(error)
    console.error('Registration failed:', errorMessage)
    throw new Error(errorMessage)
  }
}
```

### Session Management

```typescript
// Check if user is authenticated
if (api.auth.isAuthenticated()) {
  // User is logged in
}

// Validate current session
const isValid = await api.auth.validateSession()

// Logout
await api.auth.logout()
```

### Token Storage

The API client automatically handles token storage using localStorage on the client side. For more secure applications, consider using:

- HTTP-only cookies
- Secure storage libraries
- Token encryption

```typescript
// Custom token storage example
const apiClient = new ApiClient({
  onTokenRefresh: (tokens) => {
    // Store in secure storage
    if (tokens.accessToken) {
      secureStorage.setItem('accessToken', tokens.accessToken)
    }
  }
})

// Initialize from storage
const storedToken = secureStorage.getItem('accessToken')
if (storedToken) {
  apiClient.setAuthTokens({ accessToken: storedToken })
}
```

## Task Management

### Fetching Tasks

```typescript
// Get all tasks (default sorting: created_at desc)
const tasks = await api.tasks.list()

// Get tasks with custom sorting
const tasksByDueDate = await api.tasks.list({
  sort: 'due_date',
  order: 'asc'
})

// Get specific task
const task = await api.tasks.get('task-123')
```

### Creating Tasks

```typescript
// Create basic task
const newTask = await api.tasks.create({
  title: 'Complete project documentation'
})

// Create detailed task
const detailedTask = await api.tasks.create({
  title: 'Review pull request',
  description: 'Review the authentication implementation',
  status: 'todo',
  due_date: '2024-12-31T23:59:59.000Z'
})
```

### Updating Tasks

```typescript
// Update task fields
const updatedTask = await api.tasks.update('task-123', {
  title: 'Updated title',
  status: 'in_progress'
})

// Quick status updates
await api.tasks.markComplete('task-123')
await api.tasks.markInProgress('task-123')
await api.tasks.markTodo('task-123')
```

### Deleting Tasks

```typescript
// Delete single task
await api.tasks.delete('task-123')

// Delete multiple tasks
await api.tasks.deleteMultiple(['task-1', 'task-2', 'task-3'])
```

### Batch Operations

```typescript
// Create multiple tasks
const newTasks = await api.tasks.createMultiple([
  { title: 'Task 1' },
  { title: 'Task 2' },
  { title: 'Task 3' }
])

// Update multiple tasks
const updates = [
  { id: 'task-1', data: { status: 'done' } },
  { id: 'task-2', data: { status: 'in_progress' } }
]
const updatedTasks = await api.tasks.updateMultiple(updates)
```

## Error Handling

### Error Types

The API client provides specific error types for different scenarios:

```typescript
import { 
  ApiError, 
  NetworkError, 
  TimeoutError, 
  isApiError,
  isNetworkError,
  isTimeoutError,
  handleApiError 
} from '../lib/api-client'
```

### Handling Specific Errors

```typescript
async function createTaskWithErrorHandling(taskData) {
  try {
    return await api.tasks.create(taskData)
  } catch (error) {
    if (isApiError(error)) {
      if (error.status === 400) {
        // Validation error
        console.error('Validation failed:', error.data)
      } else if (error.status === 401) {
        // Authentication required
        router.push('/login')
      } else if (error.status === 404) {
        // Not found
        console.error('Resource not found')
      }
    } else if (isNetworkError(error)) {
      // Network connectivity issue
      console.error('Network error:', error.message)
    } else if (isTimeoutError(error)) {
      // Request timeout
      console.error('Request timeout')
    }
    
    // Generic error message for UI
    const userMessage = handleApiError(error)
    showErrorToast(userMessage)
  }
}
```

### Global Error Handling

```typescript
// Set up global error handlers
const apiClient = new ApiClient({
  onAuthRequired: () => {
    // Redirect to login
    window.location.href = '/login'
  }
})

// React error boundary example
class ApiErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    if (isApiError(error)) {
      // Log API errors to monitoring service
      analytics.track('api_error', {
        status: error.status,
        endpoint: error.message
      })
    }
  }
}
```

## React Integration

### Custom Hooks

```typescript
// useApi.ts
import { useState, useCallback } from 'react'
import { api, handleApiError } from '../lib/api-client'

export function useApiCall<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error }
}

// Usage in component
function TaskList() {
  const { execute, loading, error } = useApiCall<Task[]>()
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = useCallback(async () => {
    const result = await execute(() => api.tasks.list())
    if (result) {
      setTasks(result)
    }
  }, [execute])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
```

### Authentication Context

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api-client'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password })
    setUser(response.user)
  }

  const logout = async () => {
    await api.auth.logout()
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

## Type Safety

### Import Types

```typescript
import type {
  Task,
  TaskStatus,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskValidationError,
  DeleteTaskResponse
} from '../app/api/tasks/types'
```

### Type Guards

```typescript
function isValidTaskStatus(status: string): status is TaskStatus {
  return ['todo', 'in_progress', 'done'].includes(status)
}

function validateCreateTaskRequest(data: unknown): data is CreateTaskRequest {
  return (
    typeof data === 'object' &&
    data !== null &&
    'title' in data &&
    typeof (data as any).title === 'string'
  )
}
```

## Performance Optimization

### Request Caching

```typescript
// Simple cache implementation
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
}

const cache = new ApiCache()

// Cached API calls
async function getCachedTasks(): Promise<Task[]> {
  const cacheKey = 'tasks:list'
  let tasks = cache.get<Task[]>(cacheKey)
  
  if (!tasks) {
    tasks = await api.tasks.list()
    cache.set(cacheKey, tasks)
  }
  
  return tasks
}
```

### Request Debouncing

```typescript
import { debounce } from 'lodash'

// Debounced search
const debouncedSearch = debounce(async (query: string) => {
  const tasks = await api.tasks.list()
  return tasks.filter(task => 
    task.title.toLowerCase().includes(query.toLowerCase())
  )
}, 300)
```

## Security Considerations

### Token Management

1. **Storage**: Use secure storage for tokens
2. **Expiration**: Implement token refresh logic
3. **Cleanup**: Clear tokens on logout

### Request Validation

```typescript
// Validate data before sending
function validateTaskData(data: CreateTaskRequest): void {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Title is required')
  }
  if (data.title.length > 255) {
    throw new Error('Title too long')
  }
}
```

### Environment Configuration

```typescript
// Use environment variables for configuration
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  maxRetries: Number(process.env.NEXT_PUBLIC_API_MAX_RETRIES) || 3
}
```

## Testing

### Unit Tests

```typescript
// api-client.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ApiClient } from '../lib/api-client'

describe('ApiClient', () => {
  it('should make authenticated requests', async () => {
    const client = new ApiClient()
    client.setAuthTokens({ accessToken: 'test-token' })
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    })
    
    await client.getTasks()
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    )
  })
})
```

### Integration Tests

```typescript
// api-integration.test.ts
import { api } from '../lib/api-client'

describe('API Integration', () => {
  it('should create and fetch tasks', async () => {
    // Login first
    await api.auth.login({ email: 'test@example.com', password: 'password' })
    
    // Create task
    const newTask = await api.tasks.create({ title: 'Test Task' })
    expect(newTask.title).toBe('Test Task')
    
    // Fetch tasks
    const tasks = await api.tasks.list()
    expect(tasks).toContain(newTask)
  })
})
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators for better UX
3. **Type Safety**: Use TypeScript for all API interactions
4. **Authentication**: Check auth status before making requests
5. **Caching**: Implement appropriate caching strategies
6. **Retry Logic**: Handle transient failures with retries
7. **Monitoring**: Log API errors for debugging
8. **Security**: Validate all inputs and outputs

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/validate` | Validate session |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/:id` | Get specific task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Query Parameters

#### GET /api/tasks

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sort | string | `created_at` | Sort field (`created_at`, `due_date`) |
| order | string | `desc` | Sort order (`asc`, `desc`) |

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if user is logged in and token is valid
2. **400 Bad Request**: Validate request data format
3. **404 Not Found**: Ensure correct endpoint URLs
4. **500 Server Error**: Check server logs for issues
5. **Network Error**: Check internet connection and server status

### Debug Mode

```typescript
// Enable debug logging
const apiClient = new ApiClient({
  defaultHeaders: {
    'X-Debug': 'true'
  }
})

// Log all requests
const originalMakeRequest = apiClient['makeRequest']
apiClient['makeRequest'] = function(endpoint, options) {
  console.log('API Request:', endpoint, options)
  return originalMakeRequest.call(this, endpoint, options)
}
```

## Conclusion

This API integration guide provides a comprehensive foundation for building robust frontend applications that integrate with the Todo Application's REST API. The provided API client handles authentication, error management, and type safety, making it easy to build reliable user experiences.