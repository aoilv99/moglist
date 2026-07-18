/**
 * このファイルは何をするファイルか:
 * モックデータ(mocks/data/配下)を作る際に使う、日付計算のヘルパー関数をまとめたファイルです。
 * 「今日から3日後の23:59」のような、実行するたびに変化する新鮮な日付を作るために使います。
 *
 * このファイルの中でやっていること:
 * - `deadlineAt`: 現在時刻からN日後の、指定した時刻(既定23:59)のISO日時文字列を作る
 * - `nowIso`: 現在時刻をISO日時文字列で返す
 */

import { addDays, setHours, setMinutes, startOfDay } from 'date-fns'

/** Returns an ISO datetime N days from now at the given hour/minute (defaults to 23:59). */
// (日本語訳: 現在からN日後の、指定した時:分のISO日時文字列を返す(既定は23:59))
export function deadlineAt(daysFromNow: number, hour = 23, minute = 59): string {
  const base = setMinutes(setHours(startOfDay(addDays(new Date(), daysFromNow)), hour), minute)
  return base.toISOString()
}

/** 現在時刻をISO日時文字列として返す */
export function nowIso(): string {
  return new Date().toISOString()
}
