type TaskStatus = 'todo' | 'in_progress' | 'done'

interface FilterPanelProps {
  activeFilter: TaskStatus | 'all'
  taskCounts: {
    all: number
    todo: number
    in_progress: number
    done: number
  }
  onFilterChange: (filter: TaskStatus | 'all') => void
  className?: string
}

export function FilterPanel({ activeFilter, taskCounts, onFilterChange }: FilterPanelProps) {
  const filters = [
    { key: 'all' as const, label: 'All', count: taskCounts.all },
    { key: 'todo' as const, label: 'Pending', count: taskCounts.todo },
    { key: 'in_progress' as const, label: 'In Progress', count: taskCounts.in_progress },
    { key: 'done' as const, label: 'Completed', count: taskCounts.done }
  ]

  return (
    <div role="tablist" className="flex space-x-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          role="tab"
          aria-selected={activeFilter === filter.key}
          onClick={() => onFilterChange(filter.key)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onFilterChange(filter.key)
            }
          }}
          className={`px-4 py-2 rounded-md border ${
            activeFilter === filter.key
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  )
}