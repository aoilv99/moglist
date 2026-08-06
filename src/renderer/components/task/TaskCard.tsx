/**
 * このファイルは何をするファイルか:
 * 課題一覧・ダッシュボードで使われる、課題1件分のカード表示コンポーネントです。
 * クリックすると、その課題の詳細画面(/tasks/:taskId)へ移動します。
 *
 * このファイルの中でやっていること:
 * - `Link` で課題詳細画面へのリンクにする(カード全体がクリック可能)
 * - 課題名・状態バッジ・科目名・カレンダー連携バッジ・締切バッジを並べて表示する
 */

import { Link } from 'react-router-dom'
import type { Task } from '@shared/types/api'
import { CalendarSyncBadge } from './CalendarSyncBadge'
import { DeadlineBadge } from './DeadlineBadge'
import { TaskStatusBadge } from './TaskStatusBadge'

export function TaskCard({ task }: { task: Task }): JSX.Element {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="flex items-center justify-between gap-4 rounded-2xl border border-secondary/30 bg-surface px-4 py-3 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {/* truncateで長いタイトルは省略記号(...)で切り詰める */}
          <p className="truncate text-sm font-semibold text-text-base">{task.title}</p>
          <TaskStatusBadge task={task} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{task.subject ?? '科目未設定'}</p>
        <div className="mt-1">
          <CalendarSyncBadge sync={task.calendarSync} />
        </div>
      </div>
      <DeadlineBadge task={task} />
    </Link>
  )
}
