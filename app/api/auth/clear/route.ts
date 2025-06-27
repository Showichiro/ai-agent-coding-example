import { NextResponse } from 'next/server'
import { users } from '../storage'

export async function POST() {
  // Clear all users for testing purposes
  users.length = 0
  
  return NextResponse.json({
    success: true,
    message: 'Users cleared'
  })
}