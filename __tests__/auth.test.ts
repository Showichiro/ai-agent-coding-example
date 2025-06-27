import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Authentication API', () => {

  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      // Clear users before register tests
      await fetch('http://localhost:3000/api/auth/clear', {
        method: 'POST'
      })
    })

    it('should register a new user with valid email and password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'securepassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toBe('User registered successfully')
      expect(data.user).toEqual({
        id: expect.any(String),
        email: 'test@example.com'
      })
    })

    it('should return error when email already exists', async () => {
      // First registration
      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'securepassword'
        })
      })

      // Second registration with same email
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'anotherpassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Email already exists')
    })

    it('should return error for invalid email format', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'securepassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Please provide a valid email address')
    })

    it('should return error for password too short', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '123'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Password must be at least 6 characters long')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Clear users and register test user before login tests
      await fetch('http://localhost:3000/api/auth/clear', {
        method: 'POST'
      })
      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpassword'
        })
      })
    })

    it('should login with valid credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.token).toBeDefined()
      expect(typeof data.token).toBe('string')
      expect(data.user).toEqual({
        id: expect.any(String),
        email: 'testuser@example.com'
      })
    })

    it('should return error for invalid credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid email or password')
    })

    it('should return error for non-existent user', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
      })

      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid email or password')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Logged out successfully')
    })
  })

  describe('Authentication Middleware', () => {
    beforeEach(async () => {
      // Clear users before middleware tests
      await fetch('http://localhost:3000/api/auth/clear', {
        method: 'POST'
      })
    })

    it('should validate JWT token format', async () => {
      // This test will fail initially - JWT validation not implemented
      const token = 'invalid-jwt-token'
      
      const response = await fetch('http://localhost:3000/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid token')
    })

    it('should accept valid JWT token', async () => {
      // First register and login to get valid token
      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'valid@example.com', password: 'password123' })
      })

      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'valid@example.com', password: 'password123' })
      })

      const loginData = await loginResponse.json()
      const validToken = loginData.token

      const response = await fetch('http://localhost:3000/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        }
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
    })
  })
})