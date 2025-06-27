interface SortControlsProps {
  sortCriteria: 'created_at' | 'due_date'
  sortDirection: 'asc' | 'desc'
  onSortChange: (criteria: string, direction: string) => void
  isLoading?: boolean
  className?: string
}

export function SortControls({ 
  sortCriteria, 
  sortDirection, 
  onSortChange, 
  isLoading = false 
}: SortControlsProps) {
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value, sortDirection)
  }

  const handleDirectionToggle = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(sortCriteria, newDirection)
  }

  const getDirectionLabel = () => {
    if (sortCriteria === 'created_at') {
      return sortDirection === 'desc' ? 'Newest First' : 'Oldest First'
    } else {
      return sortDirection === 'asc' ? 'Earliest First' : 'Latest First'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-criteria" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <select
        id="sort-criteria"
        role="combobox"
        aria-label="Sort by criteria"
        value={sortCriteria}
        onChange={handleCriteriaChange}
        disabled={isLoading}
        className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="created_at">Created</option>
        <option value="due_date">Due Date</option>
      </select>
      
      <button
        onClick={handleDirectionToggle}
        disabled={isLoading}
        aria-label={`Sort direction: ${getDirectionLabel()}`}
        aria-pressed={sortDirection === 'desc'}
        className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {sortDirection === 'desc' ? '↓' : '↑'}
      </button>
    </div>
  )
}