import { NextRequest } from 'next/server'
import { users } from '../storage'
import { validateToken, createErrorResponse, createSuccessResponse } from '../utils'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Invalid token', 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const validation = validateToken(token)

    if (!validation.valid) {
      return createErrorResponse('Invalid token', 401)
    }

    // Find user by ID
    const user = users.find(u => u.id === validation.userId)
    if (!user) {
      return createErrorResponse('Invalid token', 401)
    }

    return createSuccessResponse({
      user: { id: user.id, email: user.email }
    })
  } catch {
    return createErrorResponse('Internal server error', 500)
  }
}