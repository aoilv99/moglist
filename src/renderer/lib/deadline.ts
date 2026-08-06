/**
 * このファイルは何をするファイルか:
 * 締切日時(ISO 8601形式の1本の文字列)と、フォーム上の「日付欄」「時刻欄」(2つの別々の
 * 入力欄)との間で相互変換を行う関数をまとめたファイルです。
 *
 * このファイルの中でやっていること:
 * - `splitDeadline`: ISO形式の締切文字列を「日付」と「時刻」に分割する
 * - `combineDeadline`: フォームで入力された「日付」と「時刻」を、1本のISO文字列に結合する
 */

import { format, isValid, parseISO } from 'date-fns'
import { DEFAULT_DEADLINE_TIME } from '@shared/constants'

/**
 * Splits an ISO deadline into a date/time pair for form editing.
 * A deadline whose time component is exactly 00:00 is treated as
 * "time not detected by OCR" and defaults to 23:59, per spec.
 * (日本語訳: ISO形式の締切を、フォーム編集用の日付・時刻のペアに分割する。
 *  時刻がちょうど00:00の場合は「OCRが時刻を検出できなかった」とみなし、
 *  仕様に従って23:59をデフォルト値として使う)
 */
export function splitDeadline(deadline: string | null | undefined): {
  date: string
  time: string
} {
  // 締切が無い場合は、日付は空・時刻はデフォルト値にする
  if (!deadline) {
    return { date: '', time: DEFAULT_DEADLINE_TIME }
  }
  const parsed = parseISO(deadline)
  // パースに失敗した(不正な日時文字列だった)場合も同様に空扱いにする
  if (!isValid(parsed)) {
    return { date: '', time: DEFAULT_DEADLINE_TIME }
  }
  const date = format(parsed, 'yyyy-MM-dd')
  const time = format(parsed, 'HH:mm')
  // 時刻がちょうど00:00なら「時刻不明」とみなし、23:59に置き換える
  return { date, time: time === '00:00' ? DEFAULT_DEADLINE_TIME : time }
}

/** Combines a date (yyyy-MM-dd) and time (HH:mm) into an ISO datetime string. */
// (日本語訳: 日付(yyyy-MM-dd)と時刻(HH:mm)を1本のISO日時文字列に結合する)
export function combineDeadline(date: string, time: string): string {
  const safeTime = time || DEFAULT_DEADLINE_TIME
  const combined = new Date(`${date}T${safeTime}:00`)
  return combined.toISOString()
}
