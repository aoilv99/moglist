/**
 * このファイルは何をするファイルか:
 * 課題一覧画面の「フィルタボタン(すべて/未完了/完了 等)」と
 * 「並び替えのドロップダウン」をまとめたコンポーネントです。
 * 選択状態そのものは持たず、選ばれた値を親コンポーネントへ通知するだけです。
 *
 * このファイルの中でやっていること:
 * - フィルタ条件6種類、並び替え条件3種類の選択肢一覧を定義する
 * - 現在選択中のフィルタボタンだけ色を変えてハイライトする
 * - ボタン/ドロップダウンが操作されたら、`onFilterChange` / `onSortChange` を呼び出す
 */

import type { TaskFilterKey, TaskSortKey } from '@shared/types/api'

// フィルタボタンの選択肢一覧(表示順もこの並びになる)
const FILTERS: { key: TaskFilterKey; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'incomplete', label: '未完了' },
  { key: 'completed', label: '完了' },
  { key: 'overdue', label: '期限切れ' },
  { key: 'today', label: '今日' },
  { key: 'thisWeek', label: '今週' }
]

// 並び替えドロップダウンの選択肢一覧
const SORTS: { key: TaskSortKey; label: string }[] = [
  { key: 'deadlineAsc', label: '締切が近い順' },
  { key: 'createdAtDesc', label: '新しく登録した順' },
  { key: 'subject', label: '科目順' }
]

interface TaskFilterBarProps {
  filter: TaskFilterKey
  sort: TaskSortKey
  onFilterChange: (filter: TaskFilterKey) => void
  onSortChange: (sort: TaskSortKey) => void
}

export function TaskFilterBar({
  filter,
  sort,
  onFilterChange,
  onSortChange
}: TaskFilterBarProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              // 現在選択中のフィルタだけ塗りつぶし表示にする
              filter === item.key
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:bg-secondary/20'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as TaskSortKey)}
        className="rounded-full border border-secondary/50 bg-surface px-3 py-1.5 text-xs text-text-base focus:border-primary focus:outline-none"
      >
        {SORTS.map((item) => (
          <option key={item.key} value={item.key}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
