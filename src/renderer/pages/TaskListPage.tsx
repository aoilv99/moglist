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
