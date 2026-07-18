/**
 * このファイルは何をするファイルか:
 * データ読み込み中に表示する、共通のローディング(くるくる回るアイコン)コンポーネントです。
 *
 * このファイルの中でやっていること:
 * - 回転アニメーション付きのアイコンと、ラベル文字列(既定は「読み込み中...」)を表示する
 */

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = '読み込み中...' }: LoadingStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
