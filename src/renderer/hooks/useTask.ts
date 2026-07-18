/**
 * このファイルは何をするファイルか:
 * 課題詳細を1件だけ取得するためのTanStack Queryフックです。
 * 課題詳細画面(TaskDetail)から呼び出されます。
 *
 * このファイルの中でやっていること:
 * - `taskId` を使って `getTask(taskId)` を呼び出す
 * - `taskId` がまだ無い(undefined)場合は、`enabled: false` で自動取得を止めておく
 *   (React Routerのパラメータがまだ読み込まれていないタイミング等の対策)
 */

import { useQuery } from '@tanstack/react-query'
import { getTask } from '@renderer/services/api/taskApi'
import { queryKeys } from './queryKeys'

export function useTask(taskId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.task(taskId ?? ''),
    queryFn: () => getTask(taskId as string),
    // taskIdが存在する時だけクエリを実行する
    enabled: Boolean(taskId)
  })
}
