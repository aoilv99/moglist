/**
 * このファイルは何をするファイルか:
 * 課題の締切情報を、「残り◯日」のようなラベル+具体的な日時の2行で表示する
 * 共通コンポーネントです。課題一覧・ダッシュボードのカードで使われます。
 *
 * このファイルの中でやっていること:
 * - `formatRemainingLabel()` で「残り3日」「本日締切」「期限切れ」等のラベル文字列を作る
 * - `getTaskDisplayStatus()` で状態を判定し、期限切れなら赤、完了ならグレーで表示する
 * - `date-fns` の `format` で、締切日時を「M月d日 HH:mm」の形式に整形する
 */

import { format, parseISO } from 'date-fns'
import type { Task } from '@shared/types/api'
import { formatRemainingLabel, getTaskDisplayStatus } from '@renderer/lib/taskStatus'

export function DeadlineBadge({ task }: { task: Pick<Task, 'status' | 'deadline'> }): JSX.Element {
  const status = getTaskDisplayStatus(task)
  const label = formatRemainingLabel(task)
  const dateLabel = format(parseISO(task.deadline), 'M月d日 HH:mm')
  // 状態に応じて文字色を変える(期限切れ=赤、完了=グレー、それ以外=通常色)
  const colorClass =
    status === 'overdue' ? 'text-danger' : status === 'completed' ? 'text-muted' : 'text-primary'

  return (
    <div className="flex flex-col">
      <span className={`text-sm font-medium ${colorClass}`}>{label}</span>
      <span className="text-xs text-muted">{dateLabel} まで</span>
    </div>
  )
}
