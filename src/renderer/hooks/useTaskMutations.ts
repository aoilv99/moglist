/**
 * このファイルは何をするファイルか:
 * 課題の作成・更新・削除・状態変更(完了/未完了の切り替え)を行うための
 * TanStack Queryミューテーションフックをまとめたファイルです。
 *
 * このファイルの中でやっていること:
 * - `useCreateTask()`: 課題を新規登録する(解析結果確認画面の「登録する」で使用)
 * - `useUpdateTask(taskId)`: 課題の内容を更新する(課題詳細画面の編集で使用)
 * - `useDeleteTask()`: 課題を削除する(課題詳細画面の削除ボタンで使用)
 * - `useUpdateTaskStatus()`: 完了/未完了を切り替える
 * - どの操作も、成功したら `queryClient.invalidateQueries(...)` を呼び、
 *   「tasks」関連のキャッシュを無効化する。これにより、一覧画面や詳細画面が
 *   自動的に最新のデータへ再取得・再描画される
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTaskInput, TaskStatus, UpdateTaskInput } from '@shared/types/api'
import {
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus
} from '@renderer/services/api/taskApi'
import { queryKeys } from './queryKeys'

/** 課題を新規作成するミューテーション */
export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      // 作成が成功したら、課題一覧のキャッシュを古いものとしてマークし、再取得させる
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

/** 指定したtaskIdの課題を更新するミューテーション */
export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTaskInput) => updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

/** 課題を削除するミューテーション */
export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })
}

/** 課題の完了/未完了状態を切り替えるミューテーション */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: (_data, variables) => {
      // 一覧のキャッシュに加えて、その課題個別の詳細キャッシュも無効化する
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.task(variables.taskId) })
    }
  })
}
