/**
 * このファイルは何をするファイルか:
 * 画像のAI解析に関するAPI呼び出し関数(analyzeAssignmentImage / retryAnalysis)を
 * まとめたファイルです。「バックエンドと実際に通信するか、モックを使うか」を
 * ここで切り替えており、画面側のコードはこの切り替えを意識しなくて済みます。
 *
 * このファイルの中でやっていること:
 * - `analyzeAssignmentImage`: 画像ファイルを送って解析結果を得る
 *   - モックモード(`USE_MOCK_API`)なら、モックハンドラ関数を呼ぶだけ
 *   - 実APIモードなら、画像をmultipart/form-data形式でPOSTし、結果を受け取る
 * - `retryAnalysis`: 既存の解析IDに対して再解析を依頼する
 * - どちらも、実API通信でエラーが起きたら `toApiError` で共通のエラー形式に変換して投げる
 */

import type { AssignmentAnalysis } from '@shared/types/api'
import { httpClient, USE_MOCK_API } from './client'
import { toApiError } from './errors'
import { mockAnalyzeAssignmentImage, mockRetryAnalysis } from '@renderer/mocks/handlers/assignmentAnalysisHandlers'

/**
 * POST /assignment-analyses (multipart/form-data, field name "image")
 * See BACKEND_HANDOFF.md for the full request/response contract.
 * (日本語訳: 画像ファイルを"image"というフィールド名でmultipart/form-data形式で送信する。
 *  リクエスト/レスポンスの詳しい仕様はBACKEND_HANDOFF.mdを参照)
 */
export async function analyzeAssignmentImage(file: File): Promise<AssignmentAnalysis> {
  // モックモードの場合は、実際の通信をせずモックデータを返す
  if (USE_MOCK_API) return mockAnalyzeAssignmentImage(file)

  try {
    // ブラウザ標準のFormDataを使い、画像をmultipart/form-data形式で送る準備をする
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await httpClient.post<AssignmentAnalysis>('/assignment-analyses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  } catch (error) {
    // axios等のエラーを、アプリ共通のApiError形式に変換してから投げ直す
    throw toApiError(error)
  }
}

/** POST /assignment-analyses/:analysisId/retry */
export async function retryAnalysis(analysisId: string): Promise<AssignmentAnalysis> {
  if (USE_MOCK_API) return mockRetryAnalysis(analysisId)

  try {
    const { data } = await httpClient.post<AssignmentAnalysis>(
      `/assignment-analyses/${analysisId}/retry`
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
