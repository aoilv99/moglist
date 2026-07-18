/**
 * このファイルは何をするファイルか:
 * 課題の配列を受け取り、`TaskCard` を縦に並べて表示する一覧コンポーネントです。
 * 課題一覧画面・ダッシュボードの各セクションで使い回されます。
 *
 * このファイルの中でやっていること:
 * - 課題が1件も無ければ、空状態(EmptyState)を表示する
 * - 課題があれば、それぞれを`TaskCard`として縦に並べる
 */

import { ListChecks } from 'lucide-react'
import type { Task } from '@shared/types/api'
import { EmptyState } from '@renderer/components/feedback/EmptyState'
import { TaskCard } from './TaskCard'

export function TaskList({ tasks }: { tasks: Task[] }): JSX.Element {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="課題がありません"
        description="条件に一致する課題が見つかりませんでした。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
