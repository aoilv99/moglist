/**
 * このファイルは何をするファイルか:
 * AI解析結果の「精度(確からしさ)」を、高/中/低のバッジとして表示する
 * 小さな共通コンポーネントです。
 *
 * このファイルの中でやっていること:
 * - 精度レベル(high/medium/low)ごとに、表示ラベルと色(緑/黄/赤)を対応付ける
 * - 対応する色のバッジを描画する
 */

import type { ConfidenceLevel } from '@shared/types/api'

// 精度レベルごとの表示ラベルと配色
const CONFIG: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: { label: '精度: 高', className: 'bg-success/10 text-success border-success/30' },
  medium: { label: '精度: 中', className: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: '精度: 低', className: 'bg-danger/10 text-danger border-danger/30' }
}

export function ConfidenceIndicator({ level }: { level: ConfidenceLevel }): JSX.Element {
  const { label, className } = CONFIG[level]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
