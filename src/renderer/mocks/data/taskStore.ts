import type { Task } from '@shared/types/api'
import { INITIAL_MOCK_TASKS } from './tasks'

/** Tiny in-memory "database" backing the mock task API for the lifetime of the app session. */
let tasks: Task[] = INITIAL_MOCK_TASKS.map((task) => ({ ...task }))
let idCounter = tasks.length

export function listTasks(): Task[] {
  return tasks
}

export function findTask(id: string): Task | undefined {
  return tasks.find((task) => task.id === id)
}

export function insertTask(task: Task): Task {
  tasks = [task, ...tasks]
  return task
}

export function updateTaskById(id: string, patch: Partial<Task>): Task | undefined {
  let updated: Task | undefined
  tasks = tasks.map((task) => {
    if (task.id !== id) return task
    updated = { ...task, ...patch, id: task.id, updatedAt: new Date().toISOString() }
    return updated
  })
  return updated
}

export function removeTask(id: string): boolean {
  const before = tasks.length
  tasks = tasks.filter((task) => task.id !== id)
  return tasks.length < before
}

export function nextTaskId(): string {
  idCounter += 1
  return `mock-task-${idCounter}`
}
