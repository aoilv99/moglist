/**
 * このファイルは何をするファイルか:
 * 課題(Task)に関するAPI呼び出し関数(作成・一覧取得・詳細取得・更新・削除・状態変更)を
 * まとめたファイルです。関数ごとに、モックAPIを使うか実APIを使うかを切り替えています。
 *
 * このファイルの中でやっていること:
 * - `createTask`: 課題を新規登録する(POST /tasks)
 * - `getTasks`: 課題一覧を取得する(GET /tasks、フィルタ・並び替え・検索条件を渡せる)
 * - `getTask`: 課題を1件取得する(GET /tasks/:taskId)
 * - `updateTask`: 課題の内容を更新する(PATCH /tasks/:taskId)
 * - `deleteTask`: 課題を削除する(DELETE /tasks/:taskId)
 * - `updateTaskStatus`: 完了/未完了の状態だけを変更する(PATCH /tasks/:taskId/status)
 * - どの関数も、モックモードなら対応するモックハンドラを呼び、実APIモードなら
 *   axiosで通信してエラーを共通形式に変換する、という同じパターンを繰り返している
 */

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
