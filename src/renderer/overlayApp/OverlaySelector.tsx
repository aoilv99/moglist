/**
 * このファイルは何をするファイルか:
 * 「スクショ」機能で画面全体に表示される、範囲選択用の透明なオーバーレイ画面です。
 * ユーザーがマウスでドラッグした矩形範囲を検出し、メインプロセスへ伝えます。
 *
 * このファイルの中でやっていること:
 * - マウスのdown/move/upを見て、ドラッグ中の矩形(四角形)の座標をリアルタイムに計算する
 * - ドラッグ中の矩形を、半透明の枠線として画面に描画する(見た目のフィードバック)
 * - マウスを離した時点の矩形を確定し、`window.mogulisOverlay.confirmRegion()` で
 *   メインプロセスへ伝える
 * - 矩形が小さすぎる(ほぼクリックのみ)場合や、Escキーが押された場合はキャンセル扱いにする
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'

// 座標1点(x, y)を表す型
interface Point {
  x: number
  y: number
}

export function OverlaySelector(): JSX.Element {
  // ドラッグ開始位置
  const [start, setStart] = useState<Point | null>(null)
  // 現在のマウス位置(ドラッグ中に更新され続ける)
  const [current, setCurrent] = useState<Point | null>(null)
  // 現在ドラッグ中かどうかのフラグ
  const draggingRef = useRef(false)

  // Escキーが押されたら選択をキャンセルする
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        window.mogulisOverlay.cancelRegion()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // マウスボタンを押した位置を「ドラッグ開始点」として記録する
  const handleMouseDown = useCallback((event: MouseEvent) => {
    draggingRef.current = true
    setStart({ x: event.clientX, y: event.clientY })
    setCurrent({ x: event.clientX, y: event.clientY })
  }, [])

  // ドラッグ中、マウスが動くたびに「現在位置」を更新する(矩形の描画に使われる)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!draggingRef.current) return
    setCurrent({ x: event.clientX, y: event.clientY })
  }, [])

  // マウスボタンを離した時、選択した矩形を確定させる
  const handleMouseUp = useCallback(() => {
    // ドラッグしていなかった場合(=クリックのみ)はキャンセル扱いにする
    if (!draggingRef.current || !start || !current) {
      window.mogulisOverlay.cancelRegion()
      return
    }
    draggingRef.current = false

    // 開始点と終了点から、左上座標+幅+高さの矩形を計算する
    // (ドラッグの方向によって start/current の大小関係が変わるためMath.min/absを使う)
    const rect = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: Math.abs(current.x - start.x),
      height: Math.abs(current.y - start.y)
    }

    // 矩形が小さすぎる場合(誤クリックとみなせる)はキャンセル扱いにする
    if (rect.width < 4 || rect.height < 4) {
      window.mogulisOverlay.cancelRegion()
      return
    }
    // 選択が確定したことをメインプロセスへ伝える
    window.mogulisOverlay.confirmRegion(rect)
  }, [start, current])

  // ドラッグ中の矩形を画面に描画するためのCSSスタイルを計算する
  const rectStyle: CSSProperties | null =
    start && current
      ? {
          position: 'absolute',
          left: Math.min(start.x, current.x),
          top: Math.min(start.y, current.y),
          width: Math.abs(current.x - start.x),
          height: Math.abs(current.y - start.y)
        }
      : null

  return (
    <div
      className="fixed inset-0 cursor-crosshair select-none bg-black/30"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 画面上部に、操作方法を案内するヒントバッジを表示する */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-1.5 text-sm text-white">
        ドラッグして範囲を選択（Escでキャンセル）
      </div>
      {/* ドラッグ中の矩形を半透明の枠線として表示する */}
      {rectStyle && (
        <div className="border-2 border-primary bg-primary/10" style={rectStyle} />
      )}
    </div>
  )
}
