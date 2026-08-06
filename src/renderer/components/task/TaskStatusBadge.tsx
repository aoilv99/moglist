/**
 * このファイルは何をするファイルか:
 * 課題の状態(完了/期限切れ/未完了)を、色付きバッジとして表示する共通コンポーネントです。
 *
 * このファイルの中でやっていること:
 * - `getTaskDisplayStatus()`(lib/taskStatus.ts)で、保存されている状態(status)と
 *   締切(deadline)から「表示上の状態」を計算する(期限切れは自動判定される)
 * - 状態ごとの表示ラベルと色を対応付けて表示する
 */

import type { Task } from '@shared/types/api'
import { getTaskDisplayStatus } from '@renderer/lib/taskStatus'

// 表示上の状態ごとのラベルと配色
const CONFIG = {
  completed: { label: '完了', className: 'bg-success/10 text-success border-success/30' },
  overdue: { label: '期限切れ', className: 'bg-danger/10 text-danger border-danger/30' },
  incomplete: { label: '未完了', className: 'bg-secondary/20 text-primary border-secondary/40' }
} as const

export function TaskStatusBadge({ task }: { task: Pick<Task, 'status' | 'deadline'> }): JSX.Element {
  const status = getTaskDisplayStatus(task)
  const { label, className } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
