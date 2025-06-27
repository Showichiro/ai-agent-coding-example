import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { TaskList } from '@/app/components/task-list'

type TaskStatus = 'todo' | 'in_progress' | 'done'

interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  due_date?: string
  created_at: string
  updated_at: string
}

describe('TaskList', () => {
  afterEach(() => {
    cleanup()
  })

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project',
      description: 'Finish the todo app',
      status: 'todo',
      due_date: '2024-12-31',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Review code',
      status: 'in_progress',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      title: 'Deploy app',
      status: 'done',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    }
  ]

  const defaultProps = {
    tasks: mockTasks,
    onTaskStatusChange: vi.fn(),
    onTaskEdit: vi.fn(),
    onTaskDelete: vi.fn()
  }

  it('renders all tasks with correct information', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByText('Complete project')).toBeInTheDocument()
    expect(screen.getByText('Review code')).toBeInTheDocument()
    expect(screen.getByText('Deploy app')).toBeInTheDocument()
  })

  it('displays task status badges', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('shows due date when available', () => {
    render(<TaskList {...defaultProps} />)
    
    expect(screen.getByText(/2024\/12\/31/)).toBeInTheDocument()
  })

  it('calls onTaskStatusChange when status is changed', () => {
    const mockOnTaskStatusChange = vi.fn()
    render(<TaskList {...defaultProps} onTaskStatusChange={mockOnTaskStatusChange} />)
    
    const statusButton = screen.getByRole('button', { name: /change status.*complete project/i })
    fireEvent.click(statusButton)
    
    expect(mockOnTaskStatusChange).toHaveBeenCalledWith('1', 'in_progress')
  })

  it('calls onTaskDelete when delete button is clicked', () => {
    const mockOnTaskDelete = vi.fn()
    render(<TaskList {...defaultProps} onTaskDelete={mockOnTaskDelete} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete.*complete project/i })
    fireEvent.click(deleteButton)
    
    expect(mockOnTaskDelete).toHaveBeenCalledWith('1')
  })

  it('shows empty state when no tasks provided', () => {
    render(<TaskList {...defaultProps} tasks={[]} />)
    
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<TaskList {...defaultProps} />)
    
    const taskList = screen.getByRole('list')
    expect(taskList).toBeInTheDocument()
    
    const taskItems = screen.getAllByRole('listitem')
    expect(taskItems).toHaveLength(3)
  })
})