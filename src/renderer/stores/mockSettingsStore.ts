/**
 * このファイルは何をするファイルか:
 * 開発用に「今どのモック解析シナリオを使うか」を管理するZustandストアです。
 * ここで選ばれた値を `mocks/handlers/` 側が読み取り、返すデータを切り替えます。
 * 画面上に切り替えUIはまだ無いため、現状は開発者がコード上でデフォルト値(success)を
 * 書き換えるか、DevToolsコンソールから直接ストアを呼び出して切り替える想定です。
 *
 * このファイルの中でやっていること:
 * - `MockAnalysisCase`: 仕様書の8パターン(成功/日付曖昧/複数候補/課題名不明/重複あり/
 *   OCR失敗/カレンダー連携失敗/API全体失敗)を表す型
 * - `MOCK_ANALYSIS_CASE_LABELS`: 各パターンの日本語表示名(将来の切り替えUIで使う想定)
 * - `useMockSettingsStore`: 現在選択中のシナリオと、それを変更する関数を提供する
 */

import { create } from 'zustand'

export type MockAnalysisCase =
  | 'success'
  | 'ambiguous_date'
  | 'multiple_deadline_candidates'
  | 'title_not_detected'
  | 'duplicate_candidates'
  | 'ocr_failed'
  | 'calendar_sync_failed'
  | 'api_failure'

// 各シナリオの日本語表示名(仕様書12章の番号に対応させている)
export const MOCK_ANALYSIS_CASE_LABELS: Record<MockAnalysisCase, string> = {
  success: '① 正常に課題を検出',
  ambiguous_date: '② 日付が曖昧',
  multiple_deadline_candidates: '③ 複数の締切候補がある',
  title_not_detected: '④ 課題名が検出できない',
  duplicate_candidates: '⑤ 重複課題候補がある',
  ocr_failed: '⑥ OCR失敗',
  calendar_sync_failed: '⑦ カレンダー連携だけ失敗',
  api_failure: '⑧ API全体が失敗'
}

interface MockSettingsState {
  mockAnalysisCase: MockAnalysisCase
  setMockAnalysisCase: (mockAnalysisCase: MockAnalysisCase) => void
}

/** Dev-only mock case selector, consumed by the mock API handlers to switch demo scenarios. */
// (日本語訳: 開発専用のモックシナリオ選択。モックAPIハンドラがこれを見て
//  返すデモ用データを切り替える)
export const useMockSettingsStore = create<MockSettingsState>((set) => ({
  mockAnalysisCase: 'success',
  setMockAnalysisCase: (mockAnalysisCase) => set({ mockAnalysisCase })
}))
