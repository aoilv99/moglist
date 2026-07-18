import {
  ApiError,
  type CreateTaskInput,
  type Task,
  type TaskListQuery,
  type TaskListResponse,
  type TaskStatus,
  type UpdateTaskInput
} from '@shared/types/api'
import { useMockSettingsStore } from '@renderer/stores/mockSettingsStore'
import { isDeadlineThisWeek, isDeadlineToday, isTaskOverdue } from '@renderer/lib/taskStatus'
import * as taskStore from '../data/taskStore'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function notFound(): never {
  throw new ApiError({ code: 'NOT_FOUND', message: '課題が見つかりませんでした。' })
}

export async function mockGetTasks(params: TaskListQuery = {}): Promise<TaskListResponse> {
  await delay(300)
  let filtered = taskStore.listTasks()

  if (params.filter && params.filter !== 'all') {
    filtered = filtered.filter((task) => {
      switch (params.filter) {
        case 'incomplete':
          return task.status === 'incomplete'
        case 'completed':
          return task.status === 'completed'
        case 'overdue':
          return isTaskOverdue(task.deadline, task.status)
        case 'today':
          return isDeadlineToday(task.deadline)
        case 'thisWeek':
          return isDeadlineThisWeek(task.deadline)
        default:
          return true
      }
    })
  }

  if (params.search) {
    const query = params.search.toLowerCase()
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.subject ?? '').toLowerCase().includes(query) ||
        (task.description ?? '').toLowerCase().includes(query)
    )
  }

  const sort = params.sort ?? 'deadlineAsc'
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'deadlineAsc') return a.deadline.localeCompare(b.deadline)
    if (sort === 'createdAtDesc') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'subject') return (a.subject ?? '').localeCompare(b.subject ?? '')
    return 0
  })

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 50
  const start = (page - 1) * pageSize
  const paged = sorted.slice(start, start + pageSize)

  return { tasks: paged, total: sorted.length, page, pageSize }
}

export async function mockGetTask(taskId: string): Promise<Task> {
  await delay(200)
  const task = taskStore.findTask(taskId)
  if (!task) notFound()
  return task
}

export async function mockCreateTask(input: CreateTaskInput): Promise<Task> {
  await delay(500)
  const mockCase = useMockSettingsStore.getState().mockAnalysisCase
  const now = new Date().toISOString()
  const calendarSync: Task['calendarSync'] =
    mockCase === 'calendar_sync_failed'
      ? {
          status: 'failed',
          error: {
            code: 'CALENDAR_SYNC_FAILED',
            message: 'カレンダーサービスへの登録に失敗しました。課題自体は登録済みです。'
          }
        }
      : { status: 'synced', provider: 'Google Calendar', syncedAt: now }

  const task: Task = {
    id: taskStore.nextTaskId(),
    title: input.title,
    subject: input.subject ?? null,
    deadline: input.deadline,
    submissionMethod: input.submissionMethod ?? null,
    description: input.description ?? null,
    status: 'incomplete',
    sourceImageUrl: input.sourceImageUrl ?? null,
    analysisId: input.analysisId ?? null,
    confidence: null,
    calendarSync,
    createdAt: now,
    updatedAt: now
  }
  return taskStore.insertTask(task)
}

export async function mockUpdateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  await delay(400)
  const updated = taskStore.updateTaskById(taskId, input)
  if (!updated) notFound()
  return updated
}

export async function mockDeleteTask(taskId: string): Promise<void> {
  await delay(400)
  const removed = taskStore.removeTask(taskId)
  if (!removed) notFound()
}

export async function mockUpdateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  await delay(300)
  const updated = taskStore.updateTaskById(taskId, { status })
  if (!updated) notFound()
  return updated
}
