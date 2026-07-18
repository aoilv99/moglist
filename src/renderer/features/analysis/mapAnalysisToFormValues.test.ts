/**
 * このファイルは何をするファイルか:
 * `mapAnalysisToFormValues.ts` の `mapAnalysisResultToFormValues` が
 * 正しく動くかを確認する単体テストファイルです。
 *
 * このファイルの中でやっていること:
 * - 全項目が揃った解析結果を、正しくフォーム値に変換できることを確認する
 * - 各項目がnull(未検出)の場合、空文字列にフォールバックすることを確認する
 * - 解析結果自体がnullの場合、既定の初期値(締切時刻23:59)が返ることを確認する
 */

import { describe, expect, it } from 'vitest'
import type { AssignmentAnalysisResult } from '@shared/types/api'
import { mapAnalysisResultToFormValues } from './mapAnalysisToFormValues'

// テストで使い回す、標準的な解析結果のサンプルデータ
const baseResult: AssignmentAnalysisResult = {
  title: 'レポート課題',
  subject: '情報科学',
  deadline: '2026-07-25T18:00:00+09:00',
  deadlineCandidates: [],
  submissionMethod: 'LMS提出',
  description: '第3章のまとめを提出すること',
  overallConfidence: 'high',
  fieldConfidence: {
    title: 'high',
    subject: 'high',
    deadline: 'high',
    submissionMethod: 'high',
    description: 'high'
  },
  ambiguousFields: [],
  duplicateCandidates: []
}

describe('mapAnalysisResultToFormValues', () => {
  it('maps a full analysis result to form values', () => {
    expect(mapAnalysisResultToFormValues(baseResult)).toEqual({
      title: 'レポート課題',
      subject: '情報科学',
      deadlineDate: '2026-07-25',
      deadlineTime: '18:00',
      submissionMethod: 'LMS提出',
      description: '第3章のまとめを提出すること'
    })
  })

  it('falls back to empty values when fields are missing', () => {
    const result: AssignmentAnalysisResult = {
      ...baseResult,
      title: null,
      subject: null,
      deadline: null,
      submissionMethod: null,
      description: null
    }
    expect(mapAnalysisResultToFormValues(result)).toEqual({
      title: '',
      subject: '',
      deadlineDate: '',
      deadlineTime: '23:59',
      submissionMethod: '',
      description: ''
    })
  })

  it('returns empty defaults when result is null', () => {
    expect(mapAnalysisResultToFormValues(null).deadlineTime).toBe('23:59')
  })
})
