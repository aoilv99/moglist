/**
 * このファイルは何をするファイルか:
 * 課題一覧画面の検索ボックス(虫眼鏡アイコン付き)を表示するコンポーネントです。
 * 入力状態は持たず、入力値の変化を親コンポーネントへ通知するだけです。
 *
 * このファイルの中でやっていること:
 * - テキスト入力欄の左側に、検索アイコンを重ねて表示する
 * - 入力が変化するたびに `onChange` を呼び出す
 */

import { Search } from 'lucide-react'

interface TaskSearchProps {
  value: string
  onChange: (value: string) => void
}

export function TaskSearch({ value, onChange }: TaskSearchProps): JSX.Element {
  return (
    <div className="relative">
      {/* pointer-events-noneでアイコン自体はクリックを受け付けないようにし、
          下にある入力欄へクリックが届くようにする */}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="課題名・科目名・説明で検索"
        className="w-full rounded-full border border-secondary/50 bg-surface py-2 pl-9 pr-3 text-sm text-text-base focus:border-primary focus:outline-none"
      />
    </div>
  )
}
