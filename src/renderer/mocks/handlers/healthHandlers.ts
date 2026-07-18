import type { ApiHealth } from '@shared/types/api'

export async function mockGetHealth(): Promise<ApiHealth> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return {
    status: 'ok',
    version: 'mock-0.1.0',
    mode: 'mock',
    checkedAt: new Date().toISOString()
  }
}
