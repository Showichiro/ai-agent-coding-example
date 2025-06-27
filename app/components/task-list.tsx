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

interface TaskListProps {
  tasks: Task[]
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onTaskEdit: (taskId: string) => void
  onTaskDelete: (taskId: string) => void
}

export function TaskList({ tasks, onTaskStatusChange, onTaskEdit, onTaskDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tasks found. Create your first task to get started!</p>
      </div>
    )
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in_progress': return 'In Progress'
      case 'done': return 'Done'
    }
  }

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'done': return 'bg-green-100 text-green-800'
    }
  }

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'todo': return 'in_progress'
      case 'in_progress': return 'done'
      case 'done': return 'todo'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <ul role="list" className="space-y-3">
      {tasks.map((task) => (
        <li key={task.id} role="listitem" className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="mt-1 text-sm text-gray-600">{task.description}</p>
              )}
              <div className="mt-2 flex items-center space-x-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                {task.due_date && (
                  <span className="text-xs text-gray-500">
                    Due: {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTaskStatusChange(task.id, getNextStatus(task.status))}
                aria-label={`Change status for ${task.title}`}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next Status
              </button>
              <button
                onClick={() => onTaskEdit(task.id)}
                aria-label={`Edit ${task.title}`}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Edit
              </button>
              <button
                onClick={() => onTaskDelete(task.id)}
                aria-label={`Delete ${task.title}`}
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}