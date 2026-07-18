/**
 * このファイルは何をするファイルか:
 * AI解析APIのレスポンス(AssignmentAnalysisResult)を、フォームの初期値
 * (TaskFormValues)に変換するための関数を定義するファイルです。
 * 解析結果確認画面でフォームを表示する時に使われます。
 *
 * このファイルの中でやっていること:
 * - `mapAnalysisResultToFormValues`: 解析結果を受け取り、フォーム用の値に変換する
 *   - 解析結果が無ければ、空のフォーム初期値を返す
 *   - 各項目がnull(検出できなかった)の場合は、空文字列に変換する
 *   - 締切(1本のISO文字列)は `splitDeadline` で日付と時刻に分割する
 */

import type { AssignmentAnalysisResult } from '@shared/types/api'
import { emptyTaskFormValues, type TaskFormValues } from '@renderer/schemas/taskForm'
import { splitDeadline } from '@renderer/lib/deadline'

/** Converts an analysis API result into initial values for the review form. */
// (日本語訳: 解析APIの結果を、確認フォームの初期値に変換する)
export function mapAnalysisResultToFormValues(
  result: AssignmentAnalysisResult | null
): TaskFormValues {
  if (!result) {
    return emptyTaskFormValues
  }
  const { date, time } = splitDeadline(result.deadline)
  return {
    title: result.title ?? '',
    subject: result.subject ?? '',
    deadlineDate: date,
    deadlineTime: time,
    submissionMethod: result.submissionMethod ?? '',
    description: result.description ?? ''
  }
}
