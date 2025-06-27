import { NextRequest, NextResponse } from 'next/server'
import { CreateTaskRequest, TaskValidationError } from './types'
import { validateCreateTaskData, ValidationError } from './validation'
import { createTask, getAllTasks, tasks } from './storage'

export { tasks } // Export for test cleanup

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sort = url.searchParams.get('sort') || 'created_at'
    const order = url.searchParams.get('order') || 'desc'

    const sortedTasks = getAllTasks(sort, order)
    return NextResponse.json(sortedTasks)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json()
    
    // Validate input data
    validateCreateTaskData(body)

    // Create the task with default values
    const newTask = createTask({
      title: body.title,
      description: body.description,
      status: body.status || 'todo',
      due_date: body.due_date
    })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message } as TaskValidationError,
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}