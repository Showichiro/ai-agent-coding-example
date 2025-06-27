// Simple in-memory storage for minimal implementation
// In a real app, this would be replaced with a proper database
export interface User {
  id: string
  email: string
  password: string
}

export const users: User[] = []