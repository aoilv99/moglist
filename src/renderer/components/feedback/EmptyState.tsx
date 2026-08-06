/**
 * このファイルは何をするファイルか:
 * 「データが1件もない」時に表示する、共通の空状態(からっぽ表示)コンポーネントです。
 * 例:「今日締切の課題はありません」「まだ課題が登録されていません」など。
 *
 * このファイルの中でやっていること:
 * - アイコン・タイトル・説明文・任意のアクション(ボタン等)を、点線枠の中に中央揃えで表示する
 * - アイコンは指定が無ければ既定のInboxアイコンを使う
 */

import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-secondary bg-surface p-10 text-center">
      <Icon className="h-9 w-9 text-secondary" />
      <p className="text-base font-medium text-text-base">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
