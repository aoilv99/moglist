/**
 * このファイルは何をするファイルか:
 * Gemini APIキーの保存状態取得・保存・削除・接続テストを行うTanStack Queryフックです。
 * 設定画面(SettingsPage)から使われます。
 *
 * このファイルの中でやっていること:
 * - `useGeminiKeyStatus`: 現在キーが保存されているかどうかを取得する(useQuery)
 * - `useSaveGeminiApiKey` / `useClearGeminiApiKey` / `useTestGeminiApiKey`: それぞれの操作を行う(useMutation)
 * - 保存・削除が成功したら、キャッシュ済みの保存状態を再取得させる(invalidateQueries)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  clearGeminiApiKey,
  getGeminiKeyStatus,
  saveGeminiApiKey,
  testGeminiApiKey
} from '@renderer/services/api/geminiSettingsApi'
import { queryKeys } from './queryKeys'

export function useGeminiKeyStatus() {
  return useQuery({
    queryKey: queryKeys.geminiKeyStatus(),
    queryFn: getGeminiKeyStatus
  })
}

export function useSaveGeminiApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => saveGeminiApiKey(key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.geminiKeyStatus() })
    }
  })
}

export function useClearGeminiApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => clearGeminiApiKey(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.geminiKeyStatus() })
    }
  })
}

export function useTestGeminiApiKey() {
  return useMutation({
    mutationFn: (key: string) => testGeminiApiKey(key)
  })
}
