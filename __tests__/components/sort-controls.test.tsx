import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { SortControls } from '@/app/components/sort-controls'

describe('SortControls', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultProps = {
    sortCriteria: 'created_at' as const,
    sortDirection: 'desc' as const,
    onSortChange: vi.fn(),
    isLoading: false
  }

  it('renders sort criteria dropdown with current selection', () => {
    render(<SortControls {...defaultProps} />)
    
    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue(/created/i)).toBeInTheDocument()
  })

  it('renders sort direction toggle button', () => {
    render(<SortControls {...defaultProps} />)
    
    const directionButton = screen.getByRole('button', { name: /sort direction/i })
    expect(directionButton).toBeInTheDocument()
    expect(directionButton).toHaveAttribute('aria-label', expect.stringMatching(/newest first|descending/i))
  })

  it('calls onSortChange when criteria is changed', () => {
    const mockOnSortChange = vi.fn()
    render(<SortControls {...defaultProps} onSortChange={mockOnSortChange} />)
    
    const dropdown = screen.getByRole('combobox', { name: /sort by/i })
    fireEvent.change(dropdown, { target: { value: 'due_date' } })
    
    expect(mockOnSortChange).toHaveBeenCalledWith('due_date', 'desc')
  })

  it('calls onSortChange when direction is toggled', () => {
    const mockOnSortChange = vi.fn()
    render(<SortControls {...defaultProps} onSortChange={mockOnSortChange} />)
    
    const directionButton = screen.getByRole('button', { name: /sort direction/i })
    fireEvent.click(directionButton)
    
    expect(mockOnSortChange).toHaveBeenCalledWith('created_at', 'asc')
  })

  it('shows loading state when isLoading is true', () => {
    render(<SortControls {...defaultProps} isLoading={true} />)
    
    const dropdown = screen.getByRole('combobox', { name: /sort by/i })
    expect(dropdown).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<SortControls {...defaultProps} />)
    
    const dropdown = screen.getByRole('combobox', { name: /sort by/i })
    expect(dropdown).toHaveAttribute('aria-label', expect.stringMatching(/sort by/i))
    
    const directionButton = screen.getByRole('button', { name: /sort direction/i })
    expect(directionButton).toHaveAttribute('aria-pressed')
  })
})