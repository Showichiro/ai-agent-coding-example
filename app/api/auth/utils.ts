// Authentication utility functions

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function generateToken(userId: string): string {
  return Buffer.from(JSON.stringify({ 
    userId, 
    timestamp: Date.now() 
  })).toString('base64')
}

export function validateToken(token: string): { valid: boolean; userId?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    
    if (!decoded.userId || !decoded.timestamp) {
      return { valid: false }
    }

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - decoded.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    if (tokenAge > maxAge) {
      return { valid: false }
    }

    return { valid: true, userId: decoded.userId }
  } catch {
    return { valid: false }
  }
}

export function createErrorResponse(error: string, status: number = 400) {
  return Response.json(
    { success: false, error },
    { status }
  )
}

export function createSuccessResponse(data: Record<string, unknown>, status: number = 200) {
  return Response.json(
    { success: true, ...data },
    { status }
  )
}