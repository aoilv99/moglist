/**
 * このファイルは何をするファイルか:
 * 外部カレンダーとの連携状態(未連携/失敗/連携済み)を、アイコン付きのラベルとして
 * 表示する共通コンポーネントです。
 *
 * このファイルの中でやっていること:
 * - `sync`(連携結果)の状態に応じて、3パターンの見た目(未連携/連携失敗/連携済み)を出し分ける
 */

import { CalendarCheck2, CalendarClock, CalendarX2 } from 'lucide-react'
import type { CalendarSyncResult } from '@shared/types/api'

export function CalendarSyncBadge({ sync }: { sync: CalendarSyncResult | null }): JSX.Element {
  // 連携情報が無い、または「未連携」状態の場合
  if (!sync || sync.status === 'not_synced') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted">
        <CalendarClock className="h-3.5 w-3.5" />
        カレンダー未連携
      </span>
    )
  }
  // 連携に失敗した場合(課題の登録自体は成功として扱われる)
  if (sync.status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-danger">
        <CalendarX2 className="h-3.5 w-3.5" />
        カレンダー連携失敗
      </span>
    )
  }
  // 連携に成功した場合
  return (
    <span className="inline-flex items-center gap-1 text-xs text-success">
      <CalendarCheck2 className="h-3.5 w-3.5" />
      カレンダー連携済み
    </span>
  )
}
