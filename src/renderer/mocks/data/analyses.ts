/**
 * このファイルは何をするファイルか:
 * モックAPI用の「画像解析結果」サンプルデータを、仕様書で求められている
 * 8つのシナリオ(①正常〜⑧API全体失敗)ぶん定義するファイルです。
 * `stores/mockSettingsStore.ts` の `mockAnalysisCase` で選ばれたシナリオに応じて、
 * `mocks/handlers/assignmentAnalysisHandlers.ts` がこのデータを返します。
 *
 * このファイルの中でやっていること:
 * - `fullConfidence`: 「全項目が高精度」という、よく使う精度パターンをまとめておく
 * - `buildAnalysis`: 解析結果オブジェクトの共通部分(id・状態・画像URL等)を組み立てる
 *   ヘルパー関数。個別のシナリオごとの差分(overrides)だけを渡せばよい
 * - ①〜⑥の各シナリオ(成功/日付曖昧/複数候補/課題名不明/重複あり/OCR失敗)を、
 *   それぞれ具体的なサンプルデータとして定義する
 * - `MOCK_ANALYSES`: シナリオのキー(英語)と、対応するサンプルデータの対応表。
 *   ⑦カレンダー連携失敗は解析結果自体は「成功」データを使い回し(taskHandlers.ts側で
 *   カレンダー連携だけ失敗させる)、⑧API全体失敗はここには含めない
 *   (handlers側でエラーを直接投げるため)
 */

import type { AssignmentAnalysis, AssignmentAnalysisResult } from '@shared/types/api'
import type { MockAnalysisCase } from '@renderer/stores/mockSettingsStore'
import { deadlineAt, nowIso } from './dateHelpers'
import { buildPlaceholderScreenshotDataUrl } from './placeholderImage'

// 「すべての項目が高精度」という、よく使う組み合わせを1つの定数にしておく
const fullConfidence: AssignmentAnalysisResult['fieldConfidence'] = {
  title: 'high',
  subject: 'high',
  deadline: 'high',
  submissionMethod: 'high',
  description: 'high'
}

/** 解析結果オブジェクトの共通部分を組み立て、シナリオごとの差分だけ上書きできるようにする */
function buildAnalysis(
  id: string,
  overrides: Partial<AssignmentAnalysis> = {}
): AssignmentAnalysis {
  return {
    id,
    status: 'completed',
    sourceImageUrl: buildPlaceholderScreenshotDataUrl(id),
    createdAt: nowIso(),
    result: null,
    error: null,
    ...overrides
  }
}

/** ① 正常に課題を検出 */
const success: AssignmentAnalysis = buildAnalysis('mock-analysis-success', {
  result: {
    title: 'データ構造とアルゴリズム 第5回レポート',
    subject: '情報科学演習',
    deadline: deadlineAt(4, 23, 59),
    deadlineCandidates: [{ deadline: deadlineAt(4, 23, 59), confidence: 'high' }],
    submissionMethod: 'LMS（Moodle）経由で提出',
    description: '二分探索木の実装と計算量の考察をレポートにまとめて提出すること。',
    overallConfidence: 'high',
    fieldConfidence: fullConfidence,
    ambiguousFields: [],
    duplicateCandidates: []
  }
})

/** ② 日付が曖昧 */
const ambiguousDate: AssignmentAnalysis = buildAnalysis('mock-analysis-ambiguous-date', {
  result: {
    title: '英語プレゼンテーション課題',
    subject: '英語コミュニケーション',
    deadline: deadlineAt(6, 23, 59),
    deadlineCandidates: [
      { deadline: deadlineAt(6, 23, 59), confidence: 'medium' },
      { deadline: deadlineAt(13, 23, 59), confidence: 'low' }
    ],
    submissionMethod: '授業内で発表',
    description: '「来週」という表記のみで具体的な日付が画像内に見つからなかったため、次週の授業日を推定しています。',
    overallConfidence: 'medium',
    fieldConfidence: { ...fullConfidence, deadline: 'medium' },
    ambiguousFields: [
      {
        field: 'deadline',
        reason: '画像内に「来週の授業までに」とのみ記載されており、具体的な日付が読み取れませんでした。',
        candidates: [deadlineAt(6, 23, 59), deadlineAt(13, 23, 59)]
      }
    ],
    duplicateCandidates: []
  }
})

/** ③ 複数の締切候補がある */
const multipleDeadlineCandidates: AssignmentAnalysis = buildAnalysis(
  'mock-analysis-multiple-deadlines',
  {
    result: {
      title: '経済学基礎 期末課題',
      subject: '経済学基礎',
      deadline: deadlineAt(10, 23, 59),
      deadlineCandidates: [
        { deadline: deadlineAt(10, 23, 59), confidence: 'medium' },
        { deadline: deadlineAt(17, 23, 59), confidence: 'medium' },
        { deadline: deadlineAt(3, 23, 59), confidence: 'low' }
      ],
      submissionMethod: 'メールで提出',
      description: '画像内に複数の締切表記（速報版・確定版）が見つかりました。候補から選択してください。',
      overallConfidence: 'medium',
      fieldConfidence: { ...fullConfidence, deadline: 'medium' },
      ambiguousFields: [
        {
          field: 'deadline',
          reason: '「速報版」と「確定版」の2つの締切表記が画像内に存在します。',
          candidates: [deadlineAt(10, 23, 59), deadlineAt(17, 23, 59), deadlineAt(3, 23, 59)]
        }
      ],
      duplicateCandidates: []
    }
  }
)

/** ④ 課題名が検出できない */
const titleNotDetected: AssignmentAnalysis = buildAnalysis('mock-analysis-title-not-detected', {
  result: {
    title: null,
    subject: '基礎化学',
    deadline: deadlineAt(5, 23, 59),
    deadlineCandidates: [{ deadline: deadlineAt(5, 23, 59), confidence: 'high' }],
    submissionMethod: '実験レポート用紙を提出',
    description: '画像の文字がかすれており、課題タイトル部分を読み取れませんでした。手動で入力してください。',
    overallConfidence: 'low',
    fieldConfidence: { ...fullConfidence, title: 'low' },
    ambiguousFields: [
      {
        field: 'title',
        reason: '画像の解像度が低く、課題名部分の文字が認識できませんでした。'
      }
    ],
    duplicateCandidates: []
  }
})

/** ⑤ 重複課題候補がある */
const duplicateCandidates: AssignmentAnalysis = buildAnalysis('mock-analysis-duplicate', {
  result: {
    title: 'データ構造とアルゴリズム 第5回レポート',
    subject: '情報科学演習',
    deadline: deadlineAt(4, 23, 59),
    deadlineCandidates: [{ deadline: deadlineAt(4, 23, 59), confidence: 'high' }],
    submissionMethod: 'LMS（Moodle）経由で提出',
    description: '二分探索木の実装と計算量の考察をレポートにまとめて提出すること。',
    overallConfidence: 'high',
    fieldConfidence: fullConfidence,
    ambiguousFields: [],
    duplicateCandidates: [
      {
        taskId: 'mock-task-existing-1',
        title: 'データ構造とアルゴリズム 第5回レポート',
        subject: '情報科学演習',
        deadline: deadlineAt(4, 23, 59),
        similarity: 0.96
      }
    ]
  }
})

/** ⑥ OCR失敗 */
const ocrFailed: AssignmentAnalysis = buildAnalysis('mock-analysis-ocr-failed', {
  status: 'failed',
  result: null,
  error: {
    code: 'OCR_FAILED',
    message: '画像からテキストを読み取れませんでした。鮮明な画像で再度お試しください。'
  }
})

// シナリオキーとサンプルデータの対応表。'api_failure'はここに含めず、
// 呼び出し側(assignmentAnalysisHandlers.ts)で直接エラーを投げる形にしている
export const MOCK_ANALYSES: Record<Exclude<MockAnalysisCase, 'api_failure'>, AssignmentAnalysis> =
  {
    success,
    ambiguous_date: ambiguousDate,
    multiple_deadline_candidates: multipleDeadlineCandidates,
    title_not_detected: titleNotDetected,
    duplicate_candidates: duplicateCandidates,
    ocr_failed: ocrFailed,
    calendar_sync_failed: success
  }
