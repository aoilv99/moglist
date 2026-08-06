/**
 * このファイルは何をするファイルか:
 * マスコットウィンドウ側で撮影・ドロップされた画像を、メインウィンドウ側で
 * 受け取って解析画面に渡すための、画面には何も表示しないコンポーネントです。
 *
 * Bridges an image handed off from the mascot window (screenshot or drop)
 * into the main window: reads the temp file back over IPC (`fetch()` can't
 * load file:// URLs from the http://localhost origin the dev server runs
 * under) into a real `File` object so the same `analyzeAssignmentImage(file)`
 * API is used regardless of source, then navigates to the analyzing screen.
 * (日本語訳: マスコットウィンドウから引き渡された画像(スクショ or ドロップ)を
 *  メインウィンドウへ橋渡しする。一時ファイルをIPC経由で読み込み
 *  (fetch()は開発サーバーのhttp://localhostからfile://を読み込めないため)、
 *  本物のFileオブジェクトを作る。こうすることで、画像の入手経路(スクショ/ドロップ)に
 *  関わらず同じ`analyzeAssignmentImage(file)`関数を使い回せる。読み込み後は
 *  解析中画面(/analyzing)へ遷移する)
 *
 * このファイルの中でやっていること:
 * - `window.mogulis.onPendingImage` で、メインプロセスからの画像通知を購読する
 * - 通知が来たら、`window.mogulis.readFile` でファイルの中身(バイト列)を読み込む
 * - バイト列からBlob・Fileオブジェクトを作り、Zustandストアに保存する
 * - プレビュー表示用に `URL.createObjectURL` でブラウザ内だけで使えるURLも作る
 * - 読み込みに失敗した場合はpendingImageをnullにし、解析中画面側でエラー表示させる
 * - 成功・失敗どちらの場合も、最後に `/analyzing` (解析中画面)へ遷移する
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePendingImageStore } from '@renderer/stores/pendingImageStore'

export function PendingImageListener(): null {
  const navigate = useNavigate()
  const setPendingImage = usePendingImageStore((state) => state.setPendingImage)

  useEffect(() => {
    const unsubscribe = window.mogulis.onPendingImage((payload) => {
      // useEffect自体はasync関数にできないため、即時実行の非同期関数として包む
      void (async () => {
        try {
          // ファイルの中身をIPC経由で読み込む(fetchではなくreadFileを使う理由は上部コメント参照)
          const buffer = await window.mogulis.readFile(payload.filePath)
          const blob = new Blob([buffer], { type: payload.mimeType })
          const file = new File([blob], payload.fileName, { type: payload.mimeType })
          // 解析APIへ渡すFileと、画面プレビュー用のURLをストアに保存する
          setPendingImage({ file, previewUrl: URL.createObjectURL(blob) })
        } catch {
          // 読み込みに失敗した場合は、解析中画面側で「画像を読み込めませんでした」と表示させる
          setPendingImage(null)
        } finally {
          // 成功・失敗どちらでも解析中画面へ移動する
          navigate('/analyzing')
        }
      })()
    })
    return unsubscribe
  }, [navigate, setPendingImage])

  return null
}
