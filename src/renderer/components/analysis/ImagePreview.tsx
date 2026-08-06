/**
 * このファイルは何をするファイルか:
 * 解析結果確認画面などで、元になったスクリーンショット画像をプレビュー表示する
 * 小さな共通コンポーネントです。
 *
 * このファイルの中でやっていること:
 * - 受け取った画像URL(src)を、枠付きのボックスの中に表示するだけ
 */

interface ImagePreviewProps {
  src: string
  alt?: string
}

export function ImagePreview({ src, alt = '元画像' }: ImagePreviewProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/40 bg-surface">
      <img src={src} alt={alt} className="max-h-72 w-full object-contain" />
    </div>
  )
}
