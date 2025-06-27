/**
 * API Client for Todo Application
 * Provides centralized HTTP client with authentication, error handling, and type safety
 */

import { Task, CreateTaskRequest, UpdateTaskRequest, TaskValidationError, DeleteTaskResponse } from '../app/api/tasks/types'

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const DEFAULT_TIMEOUT = 10000 // 10 seconds

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError: Error) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Authentication types
export interface AuthTokens {
  accessToken?: string
  refreshToken?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
  }
  token?: string
}

// API Client configuration
interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
  defaultHeaders?: Record<string, string>
  onAuthRequired?: () => void
  onTokenRefresh?: (tokens: AuthTokens) => void
}

// Request options
interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  requireAuth?: boolean
}

// Main API Client class
export class ApiClient {
  private baseUrl: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private authTokens: AuthTokens = {}
  private onAuthRequired?: () => void
  private onTokenRefresh?: (tokens: AuthTokens) => void

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE_URL
    this.timeout = config.timeout || DEFAULT_TIMEOUT
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders
    }
    this.onAuthRequired = config.onAuthRequired
    this.onTokenRefresh = config.onTokenRefresh
  }

  // Authentication methods
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = tokens
  }

  getAuthTokens(): AuthTokens {
    return this.authTokens
  }

  clearAuthTokens(): void {
    this.authTokens = {}
  }

  // Private helper methods
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.authTokens.accessToken) {
      headers.Authorization = `Bearer ${this.authTokens.accessToken}`
    }
    return headers
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { requireAuth = false, timeout = this.timeout, ...fetchOptions } = options

    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    // Prepare headers
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers
    }

    if (requireAuth) {
      Object.assign(headers, this.getAuthHeaders())
    }

    // Prepare fetch options
    const finalOptions: RequestInit = {
      ...fetchOptions,
      headers
    }

    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Handle authentication errors
      if (response.status === 401 && requireAuth) {
        this.clearAuthTokens()
        this.onAuthRequired?.()
        throw new ApiError('Authentication required', 401, response.statusText)
      }

      // Handle other errors
      if (!response.ok) {
        let errorData: unknown
        try {
          errorData = await response.json()
        } catch {
          errorData = await response.text()
        }

        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        )
      }

      // Parse response
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      } else {
        return (await response.text()) as unknown as T
      }

    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${timeout}ms`)
      }

      if (error instanceof Error) {
        throw new NetworkError('Network request failed', error)
      }

      throw new Error('Unknown error occurred')
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/login', credentials)
    
    if (response.token) {
      this.setAuthTokens({ accessToken: response.token })
      this.onTokenRefresh?.(this.authTokens)
    }
    
    return response
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/register', userData)
    
    if (response.token) {
      this.setAuthTokens({ accessToken: response.token })
      this.onTokenRefresh?.(this.authTokens)
    }
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.post('/api/auth/logout', undefined, { requireAuth: true })
    } finally {
      this.clearAuthTokens()
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.get('/api/auth/validate', { requireAuth: true })
      return true
    } catch {
      return false
    }
  }

  // Task API methods
  async getTasks(params: { sort?: string; order?: string } = {}): Promise<Task[]> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`
    
    return this.get<Task[]>(endpoint, { requireAuth: true })
  }

  async getTask(id: string): Promise<Task> {
    return this.get<Task>(`/api/tasks/${id}`, { requireAuth: true })
  }

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    return this.post<Task>('/api/tasks', taskData, { requireAuth: true })
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    return this.put<Task>(`/api/tasks/${id}`, updates, { requireAuth: true })
  }

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    return this.delete<DeleteTaskResponse>(`/api/tasks/${id}`, { requireAuth: true })
  }

  // Batch operations
  async createMultipleTasks(tasks: CreateTaskRequest[]): Promise<Task[]> {
    const promises = tasks.map(task => this.createTask(task))
    return Promise.all(promises)
  }

  async updateMultipleTasks(updates: Array<{ id: string; data: UpdateTaskRequest }>): Promise<Task[]> {
    const promises = updates.map(({ id, data }) => this.updateTask(id, data))
    return Promise.all(promises)
  }

  async deleteMultipleTasks(ids: string[]): Promise<DeleteTaskResponse[]> {
    const promises = ids.map(id => this.deleteTask(id))
    return Promise.all(promises)
  }
}

// Singleton instance for global use
export const apiClient = new ApiClient({
  onAuthRequired: () => {
    // Redirect to login page or show auth modal
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
  onTokenRefresh: (tokens) => {
    // Save tokens to localStorage or secure storage
    if (typeof window !== 'undefined' && tokens.accessToken) {
      localStorage.setItem('authToken', tokens.accessToken)
    }
  }
})

// Initialize auth tokens from storage on client side
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('authToken')
  if (storedToken) {
    apiClient.setAuthTokens({ accessToken: storedToken })
  }
}

// Helper functions for common operations
export const api = {
  // Authentication helpers
  auth: {
    login: (credentials: LoginRequest) => apiClient.login(credentials),
    register: (userData: RegisterRequest) => apiClient.register(userData),
    logout: () => apiClient.logout(),
    isAuthenticated: () => !!apiClient.getAuthTokens().accessToken,
    validateSession: () => apiClient.validateToken()
  },

  // Task helpers
  tasks: {
    list: (params?: { sort?: string; order?: string }) => apiClient.getTasks(params),
    get: (id: string) => apiClient.getTask(id),
    create: (data: CreateTaskRequest) => apiClient.createTask(data),
    update: (id: string, data: UpdateTaskRequest) => apiClient.updateTask(id, data),
    delete: (id: string) => apiClient.deleteTask(id),
    
    // Status update helpers
    markComplete: (id: string) => apiClient.updateTask(id, { status: 'done' }),
    markInProgress: (id: string) => apiClient.updateTask(id, { status: 'in_progress' }),
    markTodo: (id: string) => apiClient.updateTask(id, { status: 'todo' }),
    
    // Batch operations
    createMultiple: (tasks: CreateTaskRequest[]) => apiClient.createMultipleTasks(tasks),
    updateMultiple: (updates: Array<{ id: string; data: UpdateTaskRequest }>) => 
      apiClient.updateMultipleTasks(updates),
    deleteMultiple: (ids: string[]) => apiClient.deleteMultipleTasks(ids)
  }
}

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.data && typeof error.data === 'object' && 'error' in error.data) {
      return (error.data as TaskValidationError).error
    }
    return error.message
  }
  
  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection.'
  }
  
  if (error instanceof TimeoutError) {
    return 'Request timeout. Please try again.'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Type guards
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError
}

export const isTimeoutError = (error: unknown): error is TimeoutError => {
  return error instanceof TimeoutError
}