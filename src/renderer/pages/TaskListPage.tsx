/**
 * このファイルは何をするファイルか:
 * 課題一覧画面(ルート `/tasks`)を表示するページコンポーネントです。
 * 検索・フィルタ・並び替えの状態を持ち、それに応じた課題一覧を取得・表示します。
 *
 * このファイルの中でやっていること:
 * - `filter` / `sort` / `search` の3つの状態をこのページ内で管理する
 * - それらを条件として `useTasks()` に渡し、TanStack Queryに一覧を取得させる
 *   (条件が変わるたびに自動で再取得される)
 * - 検索欄・フィルタバーの操作結果を、対応するsetter関数で状態に反映する
 * - 読み込み中/エラー/正常時の3パターンで表示を出し分ける
 */

import { useState } from 'react'
import type { TaskFilterKey, TaskSortKey } from '@shared/types/api'
import { ErrorState } from '@renderer/components/feedback/ErrorState'
import { LoadingState } from '@renderer/components/feedback/LoadingState'
import { TaskFilterBar } from '@renderer/components/task/TaskFilterBar'
import { TaskList } from '@renderer/components/task/TaskList'
import { TaskSearch } from '@renderer/components/task/TaskSearch'
import { useTasks } from '@renderer/hooks/useTasks'

export function TaskListPage(): JSX.Element {
  const [filter, setFilter] = useState<TaskFilterKey>('all')
  const [sort, setSort] = useState<TaskSortKey>('deadlineAsc')
  const [search, setSearch] = useState('')

  // 現在のフィルタ・並び替え・検索条件で課題一覧を取得する
  const { data, isLoading, isError, error, refetch } = useTasks({
    filter,
    sort,
    search: search || undefined
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-base">課題一覧</h1>
      <TaskSearch value={search} onChange={setSearch} />
      <TaskFilterBar filter={filter} sort={sort} onFilterChange={setFilter} onSortChange={setSort} />
      {isLoading && <LoadingState label="課題を読み込み中…" />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} />}
      {!isLoading && !isError && data && <TaskList tasks={data.tasks} />}
    </div>
  )
}
