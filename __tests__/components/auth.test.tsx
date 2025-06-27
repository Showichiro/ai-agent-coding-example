import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { LoginForm } from '@/app/components/auth/login-form'
import { RegisterForm } from '@/app/components/auth/register-form'

describe('LoginForm', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders login form with email and password fields', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('calls onSubmit with email and password when form is submitted', async () => {
    const mockOnSubmit = vi.fn()
    render(<LoginForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('displays error message when login fails', () => {
    render(<LoginForm error="Invalid credentials" />)
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})

describe('RegisterForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders register form with email and password fields', () => {
    render(<RegisterForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('calls onSubmit with email and password when form is submitted', async () => {
    const mockOnSubmit = vi.fn()
    render(<RegisterForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'securepassword' }
    })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securepassword'
      })
    })
  })

  it('displays error message when registration fails', () => {
    render(<RegisterForm error="Email already exists" />)
    
    expect(screen.getByText('Email already exists')).toBeInTheDocument()
  })
})