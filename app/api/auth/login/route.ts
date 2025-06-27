import { NextRequest } from 'next/server'
import { users } from '../storage'
import { generateToken, createErrorResponse, createSuccessResponse } from '../utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user by email
    const user = users.find(u => u.email === email)
    if (!user || user.password !== password) {
      return createErrorResponse('Invalid email or password', 401)
    }

    // Generate token
    const token = generateToken(user.id)

    return createSuccessResponse({
      token,
      user: { id: user.id, email: user.email }
    })
  } catch {
    return createErrorResponse('Internal server error', 500)
  }
}