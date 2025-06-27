'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: number
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshAuth: () => Promise<void>
}

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth-token'
const USER_KEY = 'auth-user'

// JWT token validation helper
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp > currentTime
  } catch {
    return false
  }
}

// Secure token storage
const tokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },
  set: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },
  remove: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
}

// User data storage
const userStorage = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  },
  set: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  })

  const router = useRouter()

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.get()
      const storedUser = userStorage.get()

      if (storedToken && storedUser && isTokenValid(storedToken)) {
        setState({
          user: storedUser,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true
        })
      } else {
        // Clear invalid/expired tokens
        tokenStorage.remove()
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success && data.token && data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name
        }

        tokenStorage.set(data.token)
        userStorage.set(user)

        setState({
          user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true
        })

        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch {
      return { success: false, error: 'Network error occurred' }
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (data.success) {
        // Auto-login after successful registration
        return await login(email, password)
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch {
      return { success: false, error: 'Network error occurred' }
    }
  }

  const logout = () => {
    tokenStorage.remove()
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    })
    router.push('/auth/login')
  }

  const refreshAuth = async (): Promise<void> => {
    const storedToken = tokenStorage.get()
    
    if (!storedToken || !isTokenValid(storedToken)) {
      logout()
      return
    }

    // Token is still valid, maintain current state
    const storedUser = userStorage.get()
    if (storedUser) {
      setState(prev => ({
        ...prev,
        user: storedUser,
        token: storedToken,
        isAuthenticated: true
      }))
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for route protection
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Hook for protecting pages
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}