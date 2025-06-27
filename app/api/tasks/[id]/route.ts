import { NextRequest, NextResponse } from 'next/server'
import { UpdateTaskRequest, TaskValidationError, DeleteTaskResponse } from '../types'
import { validateUpdateTaskData, ValidationError } from '../validation'
import { findTaskById, updateTask, deleteTask } from '../storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateTaskRequest = await request.json()

    // Check if task exists
    const existingTask = findTaskById(id)
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Validate update data
    validateUpdateTaskData(body)

    // Update the task
    const updatedTask = updateTask(id, body)
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedTask)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const success = deleteTask(id)
    if (!success) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true } as DeleteTaskResponse)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}