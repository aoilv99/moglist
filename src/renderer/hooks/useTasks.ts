/**
 * このファイルは何をするファイルか:
 * 課題一覧を取得するためのTanStack Queryフックです。
 * ダッシュボードや課題一覧画面から呼び出され、条件(フィルタ・検索等)ごとに
 * 結果が自動的にキャッシュされます。
 *
 * このファイルの中でやっていること:
 * - `useQuery` を使い、`getTasks(query)`(APIサービス層)を呼び出す
 * - `query` の内容が変わるたびに、自動的に再取得される(キャッシュキーが変わるため)
 */

import { useQuery } from '@tanstack/react-query'
import type { TaskListQuery } from '@shared/types/api'
import { getTasks } from '@renderer/services/api/taskApi'
import { queryKeys } from './queryKeys'

export function useTasks(query: TaskListQuery = {}) {
  return useQuery({
    queryKey: queryKeys.tasks(query),
    queryFn: () => getTasks(query)
  })
}
