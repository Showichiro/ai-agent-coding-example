import { Task } from './types'

// In-memory storage for minimal implementation
// In a real application, this would be replaced with a database
export const tasks: Task[] = []
let nextId = 1

export function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
  const now = new Date().toISOString()
  const newTask: Task = {
    id: `task-${nextId++}`,
    ...taskData,
    title: taskData.title.trim(),
    created_at: now,
    updated_at: now
  }

  tasks.push(newTask)
  return newTask
}

export function findTaskById(id: string): Task | undefined {
  return tasks.find(task => task.id === id)
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const taskIndex = tasks.findIndex(task => task.id === id)
  if (taskIndex === -1) {
    return null
  }

  const updatedTask: Task = {
    ...tasks[taskIndex],
    ...updates,
    title: updates.title ? updates.title.trim() : tasks[taskIndex].title,
    updated_at: new Date().toISOString()
  }

  tasks[taskIndex] = updatedTask
  return updatedTask
}

export function deleteTask(id: string): boolean {
  const taskIndex = tasks.findIndex(task => task.id === id)
  if (taskIndex === -1) {
    return false
  }

  tasks.splice(taskIndex, 1)
  return true
}

export function getAllTasks(sort: string = 'created_at', order: string = 'desc'): Task[] {
  const sortedTasks = [...tasks]
  
  if (sort === 'created_at') {
    sortedTasks.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return order === 'asc' ? dateA - dateB : dateB - dateA
    })
  } else if (sort === 'due_date') {
    sortedTasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      
      const dateA = new Date(a.due_date).getTime()
      const dateB = new Date(b.due_date).getTime()
      return order === 'asc' ? dateA - dateB : dateB - dateA
    })
  }

  return sortedTasks
}