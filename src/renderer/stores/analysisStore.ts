import { create } from 'zustand'
import type { AssignmentAnalysis } from '@shared/types/api'

interface AnalysisStoreState {
  /**
   * Holds the most recent analysis result so `/review/:analysisId` can render it.
   * The API surface (see BACKEND_HANDOFF.md) has no `GET /assignment-analyses/:id`,
   * so this is the only place the result lives client-side.
   */
  currentAnalysis: AssignmentAnalysis | null
  setCurrentAnalysis: (analysis: AssignmentAnalysis | null) => void
}

export const useAnalysisStore = create<AnalysisStoreState>((set) => ({
  currentAnalysis: null,
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis })
}))
