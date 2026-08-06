/**
 * このファイルは何をするファイルか:
 * APIサーバーのヘルスチェック(稼働状態)を取得するTanStack Queryフックです。
 * トップバーやダッシュボードの「API接続中」表示に使われます。
 *
 * このファイルの中でやっていること:
 * - `getHealth()` を呼び出す
 * - `staleTime: 30秒` → 取得結果を30秒間は「新鮮」とみなし、無駄な再取得をしない
 * - `refetchInterval: 60秒` → 60秒ごとに自動で再取得し、接続状態の変化を検知する
 */

import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@renderer/services/api/healthApi'
import { queryKeys } from './queryKeys'

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: getHealth,
    staleTime: 30_000,
    refetchInterval: 60_000
  })
}
