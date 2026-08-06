/**
 * このファイルは何をするファイルか:
 * 画像のAI解析に関するAPI呼び出し関数(analyzeAssignmentImage / retryAnalysis)を
 * まとめたファイルです。「モックを使うか、Geminiを直接呼び出すか」を
 * ここで切り替えており、画面側のコードはこの切り替えを意識しなくて済みます。
 *
 * このファイルの中でやっていること:
 * - `analyzeAssignmentImage`: 画像ファイルを渡して解析結果を得る
 *   - モックモード(`USE_MOCK_API`)なら、モックハンドラ関数を呼ぶだけ
 *   - 実APIモードなら、画像バイト列をElectronのmainプロセスへIPCで渡し、
 *     mainプロセスがGemini APIを直接呼び出した結果を受け取る(バックエンドサーバーは介さない)
 * - `retryAnalysis`: 既存の解析IDに対して再解析を依頼する
 *   - Geminiモードでは元画像を保持していないため非対応とし、エラーを投げる
 */

import { ApiError, type AssignmentAnalysis } from '@shared/types/api'
import { USE_MOCK_API } from './client'
import { mockAnalyzeAssignmentImage, mockRetryAnalysis } from '@renderer/mocks/handlers/assignmentAnalysisHandlers'

// Geminiに送れる画像サイズの上限(inlineDataとしてBase64化するため大きすぎると失敗しやすい)
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

/**
 * 画像をElectronのmainプロセスへ渡し、Gemini APIで直接解析させる。
 * See BACKEND_HANDOFF.md for the AssignmentAnalysisResult shape this must match.
 * (日本語訳: 画像をmainプロセスへ渡し、Gemini APIで直接解析させる。
 *  結果の形はBACKEND_HANDOFF.mdで定義したAssignmentAnalysisResultに合わせる)
 */
export async function analyzeAssignmentImage(file: File): Promise<AssignmentAnalysis> {
  // モックモードの場合は、実際の通信をせずモックデータを返す
  if (USE_MOCK_API) return mockAnalyzeAssignmentImage(file)

  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError({ code: 'FILE_TOO_LARGE', message: '画像サイズが大きすぎます(15MBまで)。' })
  }

  const data = await file.arrayBuffer()
  const response = await window.mogulis.analyzeImageWithGemini({ data, mimeType: file.type })

  const analysis: AssignmentAnalysis = {
    id: crypto.randomUUID(),
    status: response.status,
    sourceImageUrl: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
    result: response.result,
    error: response.error
  }
  return analysis
}

/** Geminiモードでは元画像を保持していないため非対応 */
export async function retryAnalysis(analysisId: string): Promise<AssignmentAnalysis> {
  if (USE_MOCK_API) return mockRetryAnalysis(analysisId)

  throw new ApiError({
    code: 'AI_ANALYSIS_FAILED',
    message: 'もう一度解析するには、画像を再度スクショまたはドラッグ＆ドロップしてください。'
  })
}
