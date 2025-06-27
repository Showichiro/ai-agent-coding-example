'use client'

import { useState } from 'react'
import { FilterPanel } from '@/app/components/filter-panel'
import { SortControls } from '@/app/components/sort-controls'
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

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>('all')
  const [sortCriteria, setSortCriteria] = useState<'created_at' | 'due_date'>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Mock tasks data
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project setup',
      description: 'Set up the Next.js project with all necessary components',
      status: 'todo',
      due_date: '2024-12-31',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Implement authentication',
      description: 'Add user login and registration functionality',
      status: 'in_progress',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      title: 'Design UI components',
      status: 'done',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z'
    }
  ])

  // Calculate task counts
  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(task => task.status === 'todo').length,
    in_progress: tasks.filter(task => task.status === 'in_progress').length,
    done: tasks.filter(task => task.status === 'done').length
  }

  // Filter tasks based on active filter
  const filteredTasks = activeFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === activeFilter)

  const handleFilterChange = (filter: TaskStatus | 'all') => {
    setActiveFilter(filter)
  }

  const handleSortChange = (criteria: string, direction: string) => {
    setSortCriteria(criteria as 'created_at' | 'due_date')
    setSortDirection(direction as 'asc' | 'desc')
  }

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    console.log('Status change:', taskId, newStatus)
  }

  const handleTaskEdit = (taskId: string) => {
    console.log('Edit task:', taskId)
  }

  const handleTaskDelete = (taskId: string) => {
    console.log('Delete task:', taskId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          <p className="mt-2 text-gray-600">Manage your tasks efficiently</p>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <FilterPanel
              activeFilter={activeFilter}
              taskCounts={taskCounts}
              onFilterChange={handleFilterChange}
            />
            <SortControls
              sortCriteria={sortCriteria}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
          </div>

          <TaskList
            tasks={filteredTasks}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>
    </div>
  )
}
