/**
 * このファイルは何をするファイルか:
 * マスコットキャラクターを包んで、画像ファイルのドラッグ&ドロップを検知する
 * コンポーネントです。ブラウザ標準のHTML5ドラッグ&ドロップイベントを扱います。
 *
 * Wraps the mascot character and reports drag/drop of image files.
 * (日本語訳: マスコットキャラクターをラップし、画像ファイルのドラッグ&ドロップを
 *  親コンポーネントへ通知する)
 *
 * このファイルの中でやっていること:
 * - `dragCounter` というカウンターで、要素の内側・外側の出入りを正確に判定する
 *   (子要素をまたぐたびにdragEnter/dragLeaveが発生するため、単純なフラグだと
 *   誤判定するのを防ぐための工夫)
 * - ドラッグが要素に入ったら `onDragStateChange(true)` を呼び、見た目を変えさせる
 * - ドラッグが要素から出たら `onDragStateChange(false)` を呼ぶ
 * - ファイルがドロップされたら `onDropFile(file)` を呼んで、実際のファイルを渡す
 */

import { useCallback, useRef, type DragEvent, type ReactNode } from 'react'

interface DropZoneProps {
  onDragStateChange: (isDragging: boolean) => void
  onDropFile: (file: File) => void
  children: ReactNode
}

export function DropZone({ onDragStateChange, onDropFile, children }: DropZoneProps): JSX.Element {
  // 子要素をまたいでドラッグした時の誤判定を防ぐためのカウンター
  const dragCounter = useRef(0)

  // ドラッグしている何かが、この要素(または子要素)に入った時に呼ばれる
  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current += 1
      onDragStateChange(true)
    },
    [onDragStateChange]
  )

  // ドラッグ中、要素の上にある間ずっと呼ばれ続ける。
  // preventDefault()しないとブラウザのデフォルトのドロップ拒否動作が働いてしまう
  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  // ドラッグしている何かが、この要素(または子要素)から出た時に呼ばれる
  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current = Math.max(0, dragCounter.current - 1)
      // カウンターが0になった(=本当に要素の外に出た)時だけ、見た目を戻す
      if (dragCounter.current === 0) {
        onDragStateChange(false)
      }
    },
    [onDragStateChange]
  )

  // 実際にファイルがドロップされた時に呼ばれる
  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()
      dragCounter.current = 0
      onDragStateChange(false)
      // ドロップされたファイルのうち先頭の1つだけを使う
      const file = event.dataTransfer.files?.[0]
      if (file) onDropFile(file)
    },
    [onDropFile, onDragStateChange]
  )

  return (
    <div
      className="h-full w-full"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  )
}
