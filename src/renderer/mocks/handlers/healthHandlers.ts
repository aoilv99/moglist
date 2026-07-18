/**
 * このファイルは何をするファイルか:
 * モックモード時に、ヘルスチェックAPIの応答を返すハンドラを定義するファイルです。
 *
 * このファイルの中でやっていること:
 * - `mockGetHealth`: 150ミリ秒待ってから、「正常(ok)・モックモード」という
 *   固定の応答を返す
 */

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
