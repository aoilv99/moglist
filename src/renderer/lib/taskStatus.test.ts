/**
 * このファイルは何をするファイルか:
 * `taskStatus.ts` の各関数(状態判定・残り日数計算)が正しく動くかを確認する
 * 単体テストファイルです。`npx vitest run` で実行されます。
 *
 * このファイルの中でやっていること:
 * - 「2026-07-18 12:00(JST)」を基準の現在時刻(now)として固定する
 * - `getTaskDisplayStatus`: 完了/期限切れ/未完了それぞれのケースを確認する
 * - `formatRemainingLabel`: 「本日締切」「残り3日」「期限切れ」の表示ラベルを確認する
 * - `isDeadlineToday` / `isDeadlineThisWeek`: 今日/今週の判定が正しいかを確認する
 */

import { describe, expect, it } from 'vitest'
import {
  formatRemainingLabel,
  getTaskDisplayStatus,
  isDeadlineThisWeek,
  isDeadlineToday
} from './taskStatus'

// テスト全体で使う「基準となる現在時刻」を固定しておく(2026年7月18日12時、日本時間)
const now = new Date('2026-07-18T12:00:00+09:00')

describe('getTaskDisplayStatus', () => {
  it('returns completed when task status is completed', () => {
    // 完了済みの課題は、締切に関わらず常に「completed」になることを確認する
    expect(
      getTaskDisplayStatus({ status: 'completed', deadline: '2020-01-01T00:00:00Z' }, now)
    ).toBe('completed')
  })

  it('returns overdue when deadline has passed and task is incomplete', () => {
    // 締切が過去で、まだ完了していない課題は「overdue(期限切れ)」になることを確認する
    expect(
      getTaskDisplayStatus({ status: 'incomplete', deadline: '2026-07-17T23:59:00+09:00' }, now)
    ).toBe('overdue')
  })

  it('returns incomplete when deadline is in the future', () => {
    // 締切がまだ先の課題は「incomplete(未完了)」のままであることを確認する
    expect(
      getTaskDisplayStatus({ status: 'incomplete', deadline: '2026-07-20T23:59:00+09:00' }, now)
    ).toBe('incomplete')
  })
})

describe('formatRemainingLabel', () => {
  it('labels today deadlines', () => {
    // 締切が今日の場合、「本日締切」と表示されることを確認する
    expect(
      formatRemainingLabel({ status: 'incomplete', deadline: '2026-07-18T23:59:00+09:00' }, now)
    ).toBe('本日締切')
  })

  it('labels future deadlines with remaining days', () => {
    // 3日後が締切の場合、「残り3日」と表示されることを確認する
    expect(
      formatRemainingLabel({ status: 'incomplete', deadline: '2026-07-21T23:59:00+09:00' }, now)
    ).toBe('残り3日')
  })

  it('labels overdue tasks', () => {
    // 締切を過ぎている場合、「期限切れ」と表示されることを確認する
    expect(
      formatRemainingLabel({ status: 'incomplete', deadline: '2026-07-10T23:59:00+09:00' }, now)
    ).toBe('期限切れ')
  })
})

describe('isDeadlineToday / isDeadlineThisWeek', () => {
  it('detects today deadlines', () => {
    // 今日の日付ならtrue、翌日の日付ならfalseになることを確認する
    expect(isDeadlineToday('2026-07-18T09:00:00+09:00', now)).toBe(true)
    expect(isDeadlineToday('2026-07-19T09:00:00+09:00', now)).toBe(false)
  })

  it('detects this-week deadlines', () => {
    // 今週内の日付ならtrue、来週以降の日付ならfalseになることを確認する
    expect(isDeadlineThisWeek('2026-07-19T09:00:00+09:00', now)).toBe(true)
    expect(isDeadlineThisWeek('2026-08-01T09:00:00+09:00', now)).toBe(false)
  })
})
