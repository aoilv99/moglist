/**
 * このファイルは何をするファイルか:
 * メインウィンドウ上部のトップバー(ヘッダー)を表示するコンポーネントです。
 * キャッチコピー、モックモードのバッジ、API接続状態のバッジを表示します。
 *
 * このファイルの中でやっていること:
 * - `useHealth()` でAPIのヘルスチェック結果を取得する(60秒ごとに自動更新される)
 * - 取得結果に応じて「API確認中/API接続中/API接続不可/API不安定」のラベルと色を出し分ける
 * - `.env`の`VITE_USE_MOCK_API`がtrueの場合、「モックモード」のバッジを表示する
 */

import { useHealth } from '@renderer/hooks/useHealth'
import { USE_MOCK_API } from '@renderer/services/api/client'

export function TopBar(): JSX.Element {
  const { data: health, isLoading, isError } = useHealth()

  // 正常に接続できている(読み込み中でもエラーでもなく、statusが'ok')かどうか
  const isHealthy = !isLoading && !isError && health?.status === 'ok'
  // 状態に応じた表示ラベルを決める
  const statusLabel = isLoading
    ? 'API確認中'
    : isError
      ? 'API接続不可'
      : health?.status === 'ok'
        ? 'API接続中'
        : 'API不安定'
  // 状態に応じた背景色・文字色のクラスを決める
  const statusClass = isLoading
    ? 'bg-muted/10 text-muted'
    : isHealthy
      ? 'bg-success/10 text-success'
      : 'bg-danger/10 text-danger'
  // 状態を表す丸いドットの色を決める
  const dotClass = isLoading ? 'bg-muted' : isHealthy ? 'bg-success' : 'bg-danger'

  return (
    <header className="flex items-center justify-between border-b border-secondary/30 bg-surface px-6 py-3">
      <span className="text-sm font-medium text-muted">課題を賢く、もぐもぐ管理。</span>
      <div className="flex items-center gap-3 text-sm">
        {/* モックAPIで動いている時だけ、それとわかるバッジを表示する */}
        {USE_MOCK_API && (
          <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
            モックモード
          </span>
        )}
        {/* API接続状態を、色付きの丸ドット+テキストで表示する */}
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          {statusLabel}
        </span>
      </div>
    </header>
  )
}
