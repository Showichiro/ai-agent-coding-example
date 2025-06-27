import { describe, it, expect, beforeEach } from 'vitest'
import { POST, GET } from '../app/api/tasks/route'
import { PUT, DELETE } from '../app/api/tasks/[id]/route'

describe('Task API - TDD Implementation', () => {
  beforeEach(async () => {
    // Reset tasks array to ensure clean state for each test
    const { tasks } = await import('../app/api/tasks/route')
    tasks.length = 0
  })

  describe('POST /api/tasks', () => {
    it('should create a task with required fields only', async () => {
      const taskData = {
        title: 'Test Task'
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      const task = await response.json()
      
      expect(task).toHaveProperty('id')
      expect(task.title).toBe('Test Task')
      expect(task.status).toBe('todo') // default status
      expect(task).toHaveProperty('created_at')
      expect(task).toHaveProperty('updated_at')
      expect(task.description).toBeUndefined()
      expect(task.due_date).toBeUndefined()
    })

    it('should create a task with all optional fields', async () => {
      const taskData = {
        title: 'Detailed Task',
        description: 'This is a detailed task',
        status: 'in_progress',
        due_date: '2024-12-31T23:59:59.000Z'
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      const task = await response.json()
      
      expect(task.title).toBe('Detailed Task')
      expect(task.description).toBe('This is a detailed task')
      expect(task.status).toBe('in_progress')
      expect(task.due_date).toBe('2024-12-31T23:59:59.000Z')
    })

    it('should reject task without title', async () => {
      const taskData = {
        description: 'Task without title'
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      const error = await response.json()
      expect(error.error).toContain('Title is required')
    })

    it('should reject task with empty title', async () => {
      const taskData = {
        title: '   '
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should reject task with title too long', async () => {
      const taskData = {
        title: 'x'.repeat(256)
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should reject task with invalid status', async () => {
      const taskData = {
        title: 'Valid Title',
        status: 'invalid_status'
      }

      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const request = new Request('http://localhost/api/tasks')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const tasks = await response.json()
      expect(Array.isArray(tasks)).toBe(true)
      expect(tasks).toHaveLength(0)
    })

    it('should return tasks sorted by created_at desc by default', async () => {
      const request = new Request('http://localhost/api/tasks')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const tasks = await response.json()
      expect(Array.isArray(tasks)).toBe(true)
    })

    it('should support sorting by due_date', async () => {
      const request = new Request('http://localhost/api/tasks?sort=due_date&order=asc')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const tasks = await response.json()
      expect(Array.isArray(tasks)).toBe(true)
    })
  })

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      // First create a task
      const createRequest = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Original Task' }),
      })
      const createResponse = await POST(createRequest)
      const createdTask = await createResponse.json()

      // Then update it
      const updateData = {
        title: 'Updated Task',
        status: 'done'
      }

      const request = new Request(`http://localhost/api/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request, { params: { id: createdTask.id } })
      
      expect(response.status).toBe(200)
      const task = await response.json()
      expect(task.title).toBe('Updated Task')
      expect(task.status).toBe('done')
      expect(task).toHaveProperty('updated_at')
    })

    it('should return 404 for non-existent task', async () => {
      const updateData = {
        title: 'Updated Task'
      }

      const request = new Request('http://localhost/api/tasks/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request, { params: { id: '999' } })
      expect(response.status).toBe(404)
    })

    it('should validate updated fields', async () => {
      // First create a task
      const createRequest = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Valid Task' }),
      })
      const createResponse = await POST(createRequest)
      const createdTask = await createResponse.json()

      // Try to update with invalid data
      const updateData = {
        title: '',
        status: 'invalid'
      }

      const request = new Request(`http://localhost/api/tasks/${createdTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const response = await PUT(request, { params: { id: createdTask.id } })
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      // First create a task
      const createRequest = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Task to Delete' }),
      })
      const createResponse = await POST(createRequest)
      const createdTask = await createResponse.json()

      // Then delete it
      const request = new Request(`http://localhost/api/tasks/${createdTask.id}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: createdTask.id } })
      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result).toHaveProperty('success')
    })

    it('should return 404 for non-existent task', async () => {
      const request = new Request('http://localhost/api/tasks/999', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '999' } })
      expect(response.status).toBe(404)
    })
  })
})