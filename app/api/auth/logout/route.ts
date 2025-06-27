// No imports needed for this simple endpoint
import { createSuccessResponse, createErrorResponse } from '../utils'

export async function POST() {
  try {
    // For minimal implementation, logout just returns success
    // In a real app, this would invalidate the token in a blacklist or database
    return createSuccessResponse({
      message: 'Logged out successfully'
    })
  } catch {
    return createErrorResponse('Internal server error', 500)
  }
}