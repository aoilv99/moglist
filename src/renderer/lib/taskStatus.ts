/**
 * このファイルは何をするファイルか:
 * 課題の「状態(完了/期限切れ/未完了)」や「締切までの残り日数」を計算する
 * 純粋な関数(データを受け取って計算結果を返すだけの関数)をまとめたファイルです。
 * UIコンポーネント(バッジ表示等)やモックAPI(フィルタ処理)の両方から使われます。
 *
 * このファイルの中でやっていること:
 * - `isTaskOverdue`: 締切を過ぎていて、かつ未完了なら「期限切れ」と判定する
 * - `getTaskDisplayStatus`: 保存されているstatus(未完了/完了)と締切から、
 *   画面表示用の状態(完了/期限切れ/未完了)を計算する
 * - `getRemainingDays`: 締切までの残り日数を計算する
 * - `formatRemainingLabel`: 「残り3日」「本日締切」「期限切れ」等の表示ラベルを組み立てる
 * - `isDeadlineToday` / `isDeadlineThisWeek`: 締切が今日か、今週(月曜始まり)かを判定する
 * - すべての関数は `now`(現在時刻)を引数で受け取れるようにしてあり、
 *   テストコードで「特定の日時を基準にした場合の挙動」を確認しやすくしている
 */

import {
  differenceInCalendarDays,
  endOfWeek,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfWeek
} from 'date-fns'
import type { Task, TaskStatus } from '@shared/types/api'

// 画面表示用の状態(3種類)
export type TaskDisplayStatus = 'completed' | 'overdue' | 'incomplete'

/**
 * 締切を過ぎていて、かつ完了していなければ「期限切れ」と判定する。
 * date-fnsの`isPast`は常に実行時点の実時刻と比較してしまい、テストで
 * `now`を固定しても無視されてしまうため、`isBefore(deadline, now)`で
 * 渡された`now`を正しく基準にする。
 */
export function isTaskOverdue(deadline: string, status: TaskStatus, now: Date = new Date()): boolean {
  if (status === 'completed') return false
  return isBefore(parseISO(deadline), now)
}

/** 保存された状態(status)と締切から、画面表示用の状態を1つに決める */
export function getTaskDisplayStatus(
  task: Pick<Task, 'status' | 'deadline'>,
  now: Date = new Date()
): TaskDisplayStatus {
  if (task.status === 'completed') return 'completed'
  if (isTaskOverdue(task.deadline, task.status, now)) return 'overdue'
  return 'incomplete'
}

/** 締切までの残り日数を計算する(過去の日付ならマイナスの値になる) */
export function getRemainingDays(deadline: string, now: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(deadline), now)
}

/** Human readable remaining-time label used by DeadlineBadge. */
// (日本語訳: DeadlineBadgeコンポーネントで使われる、人が読みやすい残り時間のラベル)
export function formatRemainingLabel(
  task: Pick<Task, 'status' | 'deadline'>,
  now: Date = new Date()
): string {
  const displayStatus = getTaskDisplayStatus(task, now)
  if (displayStatus === 'completed') return '完了'
  if (displayStatus === 'overdue') return '期限切れ'

  const days = getRemainingDays(task.deadline, now)
  if (days <= 0) return '本日締切'
  if (days === 1) return '明日締切'
  return `残り${days}日`
}

/** 締切が「今日」かどうかを判定する */
export function isDeadlineToday(deadline: string, now: Date = new Date()): boolean {
  return isSameDay(parseISO(deadline), now)
}

/** 締切が「今週(月曜始まり)」かどうかを判定する */
export function isDeadlineThisWeek(deadline: string, now: Date = new Date()): boolean {
  const target = parseISO(deadline)
  // 現在日時を含む週の月曜日〜日曜日の範囲を求める
  const start = startOfWeek(now, { weekStartsOn: 1 })
  const end = endOfWeek(now, { weekStartsOn: 1 })
  return isWithinInterval(target, { start, end })
}
