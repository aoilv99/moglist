/**
 * このファイルは何をするファイルか:
 * `deadline.ts` の `splitDeadline` / `combineDeadline` が正しく動くかを確認する
 * 単体テストファイルです。
 *
 * このファイルの中でやっていること:
 * - ISO日時を日付・時刻に分割するテスト(通常ケース・時刻00:00のケース・締切なしのケース)
 * - 日付・時刻からISO日時を組み立てるテスト
 */

import { describe, expect, it } from 'vitest'
import { combineDeadline, splitDeadline } from './deadline'

describe('splitDeadline', () => {
  it('splits an ISO deadline into date and time', () => {
    // 通常の日時であれば、日付と時刻に正しく分割されることを確認する
    expect(splitDeadline('2026-07-20T14:30:00+09:00')).toEqual({
      date: '2026-07-20',
      time: '14:30'
    })
  })

  it('defaults time to 23:59 when time is midnight (time not detected)', () => {
    // 時刻がちょうど00:00の場合は「時刻未検出」とみなし、23:59になることを確認する
    expect(splitDeadline('2026-07-20T00:00:00+09:00')).toEqual({
      date: '2026-07-20',
      time: '23:59'
    })
  })

  it('returns empty date when deadline is missing', () => {
    // 締切が無い(null)場合は、日付が空文字になることを確認する
    expect(splitDeadline(null)).toEqual({ date: '', time: '23:59' })
  })
})

describe('combineDeadline', () => {
  it('combines a date and time into an ISO string', () => {
    // 日付と時刻を結合した結果が、期待通りの年・時・分になっていることを確認する
    const iso = combineDeadline('2026-07-20', '23:59')
    expect(new Date(iso).getFullYear()).toBe(2026)
    expect(new Date(iso).getHours()).toBe(23)
    expect(new Date(iso).getMinutes()).toBe(59)
  })
})
