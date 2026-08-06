/**
 * このファイルは何をするファイルか:
 * 「これから解析する画像」を一時的に保持しておくためのZustandストアです。
 * マスコットから渡された画像(ドロップ or スクショ)を、解析中画面(/analyzing)が
 * 読み取って実際の解析APIを呼び出すまでの「橋渡し役」として使われます。
 *
 * このファイルの中でやっていること:
 * - `PendingImage`: 解析対象のFileオブジェクトと、画面プレビュー用のURLをセットで持つ型
 * - `pendingImage`: 現在保持している画像(無ければnull)
 * - `setPendingImage`: 画像をセット・クリアする
 */

import { create } from 'zustand'

export interface PendingImage {
  file: File
  previewUrl: string
}

interface PendingImageState {
  pendingImage: PendingImage | null
  setPendingImage: (image: PendingImage | null) => void
}

/** The image awaiting analysis on the `/analyzing` screen (from drop or screenshot). */
// (日本語訳: `/analyzing`画面で解析されるのを待っている画像(ドロップ or スクショ由来))
export const usePendingImageStore = create<PendingImageState>((set) => ({
  pendingImage: null,
  setPendingImage: (pendingImage) => set({ pendingImage })
}))
