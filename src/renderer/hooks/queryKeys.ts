/**
 * このファイルは何をするファイルか:
 * TanStack Queryの「キャッシュキー」を1箇所にまとめて生成するためのファイルです。
 * キャッシュキーとは、取得したデータをどの名前で保存・識別するかを表す配列です。
 * ここに集約しておくことで、キー名のスペルミスや、更新すべきキャッシュの取り違えを防ぎます。
 *
 * このファイルの中でやっていること:
 * - `tasks(query)`: 課題一覧のキャッシュキー(検索条件ごとに別々にキャッシュされる)
 * - `task(taskId)`: 課題詳細のキャッシュキー
 * - `health()`: ヘルスチェックのキャッシュキー
 * - `geminiKeyStatus()`: Gemini APIキーの保存状態のキャッシュキー
 */

import type { TaskListQuery } from '@shared/types/api'

export const queryKeys = {
  tasks: (query: TaskListQuery = {}) => ['tasks', query] as const,
  task: (taskId: string) => ['tasks', 'detail', taskId] as const,
  health: () => ['health'] as const,
  geminiKeyStatus: () => ['geminiKeyStatus'] as const
}
