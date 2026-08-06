/**
 * このファイルは何をするファイルか:
 * マスコットキャラクター(もぐた)の画像そのものを表示するコンポーネントです。
 * 状態(state)に応じて、CSSアニメーションのクラス名を切り替えます。
 *
 * このファイルの中でやっていること:
 * - 状態ごとに適用するTailwindのアニメーションクラス名を対応表として定義する
 * - 対応する画像(assets/mascot/index.tsから取得)を表示する
 * - マウスダウンイベントを親コンポーネントへそのまま伝える(クリック/ドラッグ判定は親が行う)
 */

import type { MouseEvent } from 'react'
import { MASCOT_IMAGES } from '@renderer/assets/mascot'
import type { MascotState } from '@renderer/stores/mascotStore'

// マスコットの状態ごとに適用するCSSアニメーションのクラス名
const STATE_ANIMATION_CLASS: Record<MascotState, string> = {
  idle: 'animate-mascot-idle', // ゆっくり上下に動く
  'drag-over': 'scale-110', // 画像がドラッグされてきたら少し拡大する
  eating: 'animate-mascot-eating', // もぐもぐ動く
  thinking: 'animate-mascot-thinking', // 薄く点滅して「考え中」を表現する
  success: 'animate-mascot-success', // 嬉しそうに揺れる
  error: 'animate-mascot-error' // 左右に小刻みに揺れる(困った表現)
}

interface MascotCharacterProps {
  state: MascotState
  onMouseDown?: (event: MouseEvent) => void
}

export function MascotCharacter({ state, onMouseDown }: MascotCharacterProps): JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="もぐた"
      onMouseDown={onMouseDown}
      className={`h-full w-full origin-bottom cursor-pointer select-none transition-transform duration-200 ${STATE_ANIMATION_CLASS[state]}`}
    >
      <img
        src={MASCOT_IMAGES[state]}
        alt="もぐた"
        draggable={false}
        className="h-full w-full object-contain drop-shadow-lg"
      />
    </div>
  )
}
