import { NextRequest } from 'next/server'
import { users } from '../storage'
import { validateEmail, validatePassword, generateUserId, createErrorResponse, createSuccessResponse } from '../utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate email format
    if (!validateEmail(email)) {
      return createErrorResponse('Please provide a valid email address')
    }

    // Validate password length
    if (!validatePassword(password)) {
      return createErrorResponse('Password must be at least 6 characters long')
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === email)
    if (existingUser) {
      return createErrorResponse('Email already exists')
    }

    // Create new user
    const userId = generateUserId()
    const newUser = { id: userId, email, password }
    users.push(newUser)

    return createSuccessResponse(
      {
        message: 'User registered successfully',
        user: { id: userId, email }
      },
      201
    )
  } catch {
    return createErrorResponse('Internal server error', 500)
  }
}