import type { AssignmentAnalysis } from '@shared/types/api'
import { httpClient, USE_MOCK_API } from './client'
import { toApiError } from './errors'
import { mockAnalyzeAssignmentImage, mockRetryAnalysis } from '@renderer/mocks/handlers/assignmentAnalysisHandlers'

/**
 * POST /assignment-analyses (multipart/form-data, field name "image")
 * See BACKEND_HANDOFF.md for the full request/response contract.
 */
export async function analyzeAssignmentImage(file: File): Promise<AssignmentAnalysis> {
  if (USE_MOCK_API) return mockAnalyzeAssignmentImage(file)

  try {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await httpClient.post<AssignmentAnalysis>('/assignment-analyses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

/** POST /assignment-analyses/:analysisId/retry */
export async function retryAnalysis(analysisId: string): Promise<AssignmentAnalysis> {
  if (USE_MOCK_API) return mockRetryAnalysis(analysisId)

  try {
    const { data } = await httpClient.post<AssignmentAnalysis>(
      `/assignment-analyses/${analysisId}/retry`
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
