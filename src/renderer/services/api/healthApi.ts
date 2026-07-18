import type { ApiHealth } from '@shared/types/api'
import { httpClient, USE_MOCK_API } from './client'
import { toApiError } from './errors'
import { mockGetHealth } from '@renderer/mocks/handlers/healthHandlers'

/** GET /health */
export async function getHealth(): Promise<ApiHealth> {
  if (USE_MOCK_API) return mockGetHealth()
  try {
    const { data } = await httpClient.get<ApiHealth>('/health')
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
