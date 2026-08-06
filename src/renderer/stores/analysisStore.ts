/**
 * このファイルは何をするファイルか:
 * 直近の画像解析結果を、アプリのメモリ上(Zustandストア)に保持しておくためのファイルです。
 * 解析結果確認画面(/review/:analysisId)は、ここに保存された結果を表示に使います。
 *
 * このファイルの中でやっていること:
 * - `currentAnalysis`: 最新の解析結果を保持する(元々バックエンドAPIには
 *   「解析結果をIDで再取得するAPI」が用意されていないため、クライアント側の
 *   このストアだけが結果の保管場所になっている。ウィンドウをリロードすると消える点に注意)
 * - `setCurrentAnalysis`: 解析結果を保存・更新する
 */

import { create } from 'zustand'
import type { AssignmentAnalysis } from '@shared/types/api'

interface AnalysisStoreState {
  /**
   * Holds the most recent analysis result so `/review/:analysisId` can render it.
   * The API surface (see BACKEND_HANDOFF.md) has no `GET /assignment-analyses/:id`,
   * so this is the only place the result lives client-side.
   * (日本語訳: `/review/:analysisId`画面が表示できるよう、直近の解析結果を保持する。
   *  API仕様(BACKEND_HANDOFF.md参照)には解析結果をIDで取得し直すAPIが無いため、
   *  クライアント側ではこの場所にしか結果が存在しない)
   */
  currentAnalysis: AssignmentAnalysis | null
  setCurrentAnalysis: (analysis: AssignmentAnalysis | null) => void
}

export const useAnalysisStore = create<AnalysisStoreState>((set) => ({
  currentAnalysis: null,
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis })
}))
