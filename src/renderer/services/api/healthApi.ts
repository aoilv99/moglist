/**
 * このファイルは何をするファイルか:
 * APIサーバーの稼働状態を確認する「ヘルスチェック」APIを呼び出すファイルです。
 *
 * このファイルの中でやっていること:
 * - `getHealth`: モックモードならモックの応答を、実APIモードなら
 *   `GET /health` を呼び出して稼働状態を取得する
 */

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
