import { describe, expect, it } from 'vitest'
import type { AssignmentAnalysisResult } from '@shared/types/api'
import { mapAnalysisResultToFormValues } from './mapAnalysisToFormValues'

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
