import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { FilterPanel } from '@/app/components/filter-panel'

type TaskStatus = 'todo' | 'in_progress' | 'done'

describe('FilterPanel', () => {
  afterEach(() => {
    cleanup()
  })

  const mockTaskCounts = {
    all: 12,
    todo: 5,
    in_progress: 3,
    done: 4
  }

  const defaultProps = {
    activeFilter: 'all' as TaskStatus | 'all',
    taskCounts: mockTaskCounts,
    onFilterChange: vi.fn()
  }

  it('renders all filter buttons with correct labels and counts', () => {
    render(<FilterPanel {...defaultProps} />)
    
    expect(screen.getByRole('tab', { name: /all.*12/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /pending.*5/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /in progress.*3/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /completed.*4/i })).toBeInTheDocument()
  })

  it('highlights the active filter button', () => {
    render(<FilterPanel {...defaultProps} activeFilter="todo" />)
    
    const pendingButton = screen.getByRole('tab', { name: /pending.*5/i })
    expect(pendingButton).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onFilterChange when a filter button is clicked', () => {
    const mockOnFilterChange = vi.fn()
    render(<FilterPanel {...defaultProps} onFilterChange={mockOnFilterChange} />)
    
    const completedButton = screen.getByRole('tab', { name: /completed.*4/i })
    fireEvent.click(completedButton)
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('done')
  })

  it('has proper accessibility attributes', () => {
    render(<FilterPanel {...defaultProps} />)
    
    const buttonGroup = screen.getByRole('tablist')
    expect(buttonGroup).toBeInTheDocument()
    
    const allButton = screen.getByRole('tab', { name: /all.*12/i })
    expect(allButton).toHaveAttribute('aria-selected', 'true')
  })

  it('supports keyboard navigation', () => {
    render(<FilterPanel {...defaultProps} />)
    
    const pendingButton = screen.getByRole('tab', { name: /pending.*5/i })
    pendingButton.focus()
    fireEvent.keyDown(pendingButton, { key: 'Enter' })
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith('todo')
  })
})