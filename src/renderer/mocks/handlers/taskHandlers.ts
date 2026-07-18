/**
 * このファイルは何をするファイルか:
 * モックモード時に、課題(Task)関連のAPI(一覧・詳細・作成・更新・削除・状態変更)の
 * 応答を返すハンドラ関数をまとめたファイルです。データの実体は`mocks/data/taskStore.ts`
 * (メモリ上の簡易データベース)に保存されています。
 *
 * このファイルの中でやっていること:
 * - `delay`: 実際のAPIらしく感じられるよう、わざと待ってから応答する
 * - `notFound`: 「課題が見つからない」エラーをまとめて投げるヘルパー
 * - `mockGetTasks`: 一覧取得。フィルタ→検索→並び替え→ページングの順に絞り込む
 * - `mockGetTask`: 詳細取得。見つからなければエラーにする
 * - `mockCreateTask`: 新規作成。現在選択中のモックシナリオが「カレンダー連携失敗」なら、
 *   わざとカレンダー連携だけ失敗した状態の課題を作る(課題自体の作成は成功させる)
 * - `mockUpdateTask` / `mockDeleteTask` / `mockUpdateTaskStatus`: 更新・削除・状態変更
 */

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

/** 指定したミリ秒だけ待つ(本物のAPI通信のような遅延を演出するため) */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 「課題が見つからない」エラーを投げる共通ヘルパー */
function notFound(): never {
  throw new ApiError({ code: 'NOT_FOUND', message: '課題が見つかりませんでした。' })
}

/** 課題一覧を取得する。フィルタ→検索→並び替え→ページングの順に処理する */
export async function mockGetTasks(params: TaskListQuery = {}): Promise<TaskListResponse> {
  await delay(300)
  let filtered = taskStore.listTasks()

  // フィルタ条件(すべて以外)が指定されていれば、条件に一致する課題だけに絞り込む
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

  // 検索キーワードが指定されていれば、課題名・科目名・説明のいずれかに含まれるものだけに絞る
  if (params.search) {
    const query = params.search.toLowerCase()
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.subject ?? '').toLowerCase().includes(query) ||
        (task.description ?? '').toLowerCase().includes(query)
    )
  }

  // 指定された並び順(既定は締切が近い順)で並べ替える
  const sort = params.sort ?? 'deadlineAsc'
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'deadlineAsc') return a.deadline.localeCompare(b.deadline)
    if (sort === 'createdAtDesc') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'subject') return (a.subject ?? '').localeCompare(b.subject ?? '')
    return 0
  })

  // ページング処理(既定は1ページ目・最大50件)
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 50
  const start = (page - 1) * pageSize
  const paged = sorted.slice(start, start + pageSize)

  return { tasks: paged, total: sorted.length, page, pageSize }
}

/** 課題を1件取得する */
export async function mockGetTask(taskId: string): Promise<Task> {
  await delay(200)
  const task = taskStore.findTask(taskId)
  if (!task) notFound()
  return task
}

/** 課題を新規作成する */
export async function mockCreateTask(input: CreateTaskInput): Promise<Task> {
  await delay(500)
  const mockCase = useMockSettingsStore.getState().mockAnalysisCase
  const now = new Date().toISOString()
  // 選択中のモックシナリオが「カレンダー連携失敗」の場合だけ、わざと失敗させる。
  // それ以外は正常に連携できたことにする(課題の登録自体はどちらの場合も成功する)
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

/** 課題を更新する */
export async function mockUpdateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  await delay(400)
  const updated = taskStore.updateTaskById(taskId, input)
  if (!updated) notFound()
  return updated
}

/** 課題を削除する */
export async function mockDeleteTask(taskId: string): Promise<void> {
  await delay(400)
  const removed = taskStore.removeTask(taskId)
  if (!removed) notFound()
}

/** 課題の完了/未完了状態だけを変更する */
export async function mockUpdateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  await delay(300)
  const updated = taskStore.updateTaskById(taskId, { status })
  if (!updated) notFound()
  return updated
}
