/**
 * このファイルは何をするファイルか:
 * マスコットをクリックした時に表示される、ポップアップメニュー(「スクショ」「タスク確認」)の
 * 見た目を作るコンポーネントです。
 *
 * このファイルの中でやっていること:
 * - 「スクショ」ボタンと「タスク確認」ボタンを描画する
 * - ボタンが押されたら、親から渡された関数(onScreenshot/onCheckTasks)を呼び出すだけで、
 *   実際の処理(スクショ撮影・画面遷移)自体はこのファイルでは行わない
 */

import { Camera, ListChecks } from 'lucide-react'

interface MascotMenuProps {
  onScreenshot: () => void
  onCheckTasks: () => void
}

export function MascotMenu({ onScreenshot, onCheckTasks }: MascotMenuProps): JSX.Element {
  return (
    <div className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-2xl border border-secondary/60 bg-surface shadow-xl">
      <button
        type="button"
        onClick={onScreenshot}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text-base transition hover:bg-background"
      >
        <Camera className="h-4 w-4 text-primary" />
        スクショ
      </button>
      <div className="h-px bg-secondary/40" />
      <button
        type="button"
        onClick={onCheckTasks}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-text-base transition hover:bg-background"
      >
        <ListChecks className="h-4 w-4 text-primary" />
        タスク確認
      </button>
    </div>
  )
}
