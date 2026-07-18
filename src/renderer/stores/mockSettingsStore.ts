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
export const useMockSettingsStore = create<MockSettingsState>((set) => ({
  mockAnalysisCase: 'success',
  setMockAnalysisCase: (mockAnalysisCase) => set({ mockAnalysisCase })
}))
