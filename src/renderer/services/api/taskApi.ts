import type {
  CreateTaskInput,
  Task,
  TaskListQuery,
  TaskListResponse,
  TaskStatus,
  UpdateTaskInput
} from '@shared/types/api'
import { httpClient, USE_MOCK_API } from './client'
import { toApiError } from './errors'
import {
  mockCreateTask,
  mockDeleteTask,
  mockGetTask,
  mockGetTasks,
  mockUpdateTask,
  mockUpdateTaskStatus
} from '@renderer/mocks/handlers/taskHandlers'

/** POST /tasks */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  if (USE_MOCK_API) return mockCreateTask(input)
  try {
    const { data } = await httpClient.post<Task>('/tasks', input)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

/** GET /tasks */
export async function getTasks(params?: TaskListQuery): Promise<TaskListResponse> {
  if (USE_MOCK_API) return mockGetTasks(params)
  try {
    const { data } = await httpClient.get<TaskListResponse>('/tasks', { params })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

/** GET /tasks/:taskId */
export async function getTask(taskId: string): Promise<Task> {
  if (USE_MOCK_API) return mockGetTask(taskId)
  try {
    const { data } = await httpClient.get<Task>(`/tasks/${taskId}`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

/** PATCH /tasks/:taskId */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  if (USE_MOCK_API) return mockUpdateTask(taskId, input)
  try {
    const { data } = await httpClient.patch<Task>(`/tasks/${taskId}`, input)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

/** DELETE /tasks/:taskId */
export async function deleteTask(taskId: string): Promise<void> {
  if (USE_MOCK_API) return mockDeleteTask(taskId)
  try {
    await httpClient.delete(`/tasks/${taskId}`)
  } catch (error) {
    throw toApiError(error)
  }
}

/** PATCH /tasks/:taskId/status */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  if (USE_MOCK_API) return mockUpdateTaskStatus(taskId, status)
  try {
    const { data } = await httpClient.patch<Task>(`/tasks/${taskId}/status`, { status })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
