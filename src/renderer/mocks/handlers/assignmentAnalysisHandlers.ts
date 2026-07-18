import { ApiError, type AssignmentAnalysis } from '@shared/types/api'
import { useMockSettingsStore } from '@renderer/stores/mockSettingsStore'
import { MOCK_ANALYSES } from '../data/analyses'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildScenarioAnalysis(analysisId: string): AssignmentAnalysis {
  const mockCase = useMockSettingsStore.getState().mockAnalysisCase
  if (mockCase === 'api_failure') {
    throw new ApiError({
      code: 'AI_ANALYSIS_FAILED',
      message: 'AI解析サーバーに接続できませんでした。時間をおいて再度お試しください。'
    })
  }
  const template = MOCK_ANALYSES[mockCase]
  return { ...template, id: analysisId, createdAt: new Date().toISOString() }
}

export async function mockAnalyzeAssignmentImage(_file: File): Promise<AssignmentAnalysis> {
  await delay(900)
  return buildScenarioAnalysis(`mock-analysis-${Date.now()}`)
}

export async function mockRetryAnalysis(analysisId: string): Promise<AssignmentAnalysis> {
  await delay(900)
  return buildScenarioAnalysis(analysisId)
}
