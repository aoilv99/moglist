/**
 * このファイルは何をするファイルか:
 * エラーが発生した時に表示する、共通のエラー表示コンポーネントです。
 * エラーの種類に応じたアイコン・タイトル・説明文を出し分け、
 * 「もう一度試す」「キャンセル」ボタンも表示できます。
 *
 * このファイルの中でやっていること:
 * - 受け取った `error` が `ApiError` インスタンスであれば、そのエラーコードを取り出す
 * - `getErrorMessages.ts` の `getErrorPresentation()` で、エラーコードに応じた
 *   見た目(アイコン・タイトル・説明文)を取得する
 * - エラーの実メッセージがあればそれを、無ければ既定の説明文を表示する
 * - `onRetry` / `onCancel` が渡された時だけ、対応するボタンを表示する
 */

import { ApiError } from '@shared/types/api'
import { getErrorPresentation } from '@renderer/lib/errorMessages'

interface ErrorStateProps {
  error?: unknown
  onRetry?: () => void
  onCancel?: () => void
  retryLabel?: string
  cancelLabel?: string
}

export function ErrorState({
  error,
  onRetry,
  onCancel,
  retryLabel = 'もう一度試す',
  cancelLabel = 'キャンセル'
}: ErrorStateProps): JSX.Element {
  // ApiErrorであればエラーコードを取り出し、エラーの種類ごとの表示に使う
  const code = error instanceof ApiError ? error.code : undefined
  // Errorインスタンスであれば、そのメッセージ文字列を取り出す
  const message = error instanceof Error ? error.message : undefined
  const presentation = getErrorPresentation(code)
  const Icon = presentation.icon

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
      <Icon className="h-10 w-10 text-danger" />
      <p className="text-base font-semibold text-text-base">{presentation.title}</p>
      {/* 実際のエラーメッセージがあればそれを、なければ既定の説明文を表示する */}
      <p className="text-sm text-muted">{message || presentation.description}</p>
      <div className="mt-2 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-sm text-muted hover:bg-background"
          >
            {cancelLabel}
          </button>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}
