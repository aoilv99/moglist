/**
 * このファイルは何をするファイルか:
 * 「本当に削除しますか？」のような、確認を求める共通のモーダルダイアログです。
 * 課題削除など、取り消しが難しい操作の前に表示されます。
 *
 * このファイルの中でやっていること:
 * - `open` がfalseの時は何も表示しない(null を返す)
 * - 画面全体を覆う半透明の背景(オーバーレイ)を表示し、そこをクリックするとキャンセル扱いにする
 * - ダイアログ本体をクリックしてもキャンセルされないよう、`stopPropagation()` でクリックの
 *   伝播を止める
 * - `destructive`(危険な操作かどうか)に応じて、確定ボタンの色を赤(削除等)/通常色に変える
 */

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '削除する',
  cancelLabel = 'キャンセル',
  destructive = true,
  onConfirm,
  onCancel
}: ConfirmDialogProps): JSX.Element | null {
  // 表示フラグがfalseなら何も描画しない
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel} // 背景(オーバーレイ)をクリックしたらキャンセル扱いにする
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()} // ダイアログ本体のクリックは外側へ伝播させない
      >
        <p className="text-base font-semibold text-text-base">{title}</p>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm text-muted hover:bg-background"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 ${
              destructive ? 'bg-danger' : 'bg-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
