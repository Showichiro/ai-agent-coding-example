import { describe, it, expect, beforeEach } from 'vitest'
import { ApiClient, api, handleApiError, isApiError } from '../lib/api-client'

describe('API Client', () => {
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient()
  })

  describe('Configuration', () => {
    it('should initialize with default config', () => {
      expect(client).toBeDefined()
      expect(client.getAuthTokens()).toEqual({})
    })

    it('should set and get auth tokens', () => {
      const tokens = { accessToken: 'test-token' }
      client.setAuthTokens(tokens)
      expect(client.getAuthTokens()).toEqual(tokens)
    })

    it('should clear auth tokens', () => {
      client.setAuthTokens({ accessToken: 'test-token' })
      client.clearAuthTokens()
      expect(client.getAuthTokens()).toEqual({})
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors correctly', () => {
      const apiError = new Error('API Error')
      const message = handleApiError(apiError)
      expect(typeof message).toBe('string')
    })

    it('should identify API errors', () => {
      const error = new Error('Test error')
      expect(isApiError(error)).toBe(false)
    })
  })

  describe('API Helpers', () => {
    it('should have auth methods', () => {
      expect(typeof api.auth.login).toBe('function')
      expect(typeof api.auth.register).toBe('function')
      expect(typeof api.auth.logout).toBe('function')
      expect(typeof api.auth.isAuthenticated).toBe('function')
    })

    it('should have task methods', () => {
      expect(typeof api.tasks.list).toBe('function')
      expect(typeof api.tasks.create).toBe('function')
      expect(typeof api.tasks.update).toBe('function')
      expect(typeof api.tasks.delete).toBe('function')
    })

    it('should check authentication status', () => {
      const isAuth = api.auth.isAuthenticated()
      expect(typeof isAuth).toBe('boolean')
    })
  })
})