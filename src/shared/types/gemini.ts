/**
 * このファイルは何をするファイルか:
 * Electronのmainプロセスが直接Gemini APIを呼び出して画像解析を行った結果を、
 * main/preload/rendererの3箇所で共有するための型定義です。
 * `AssignmentAnalysisResult`型自体は既存の`@shared/types/api`をそのまま使い、
 * ここでは「IPC越しにやり取りするレスポンスの形」だけを定義します。
 */

import type { ApiErrorInfo, AssignmentAnalysisResult } from './api'

/** mainプロセスのGemini呼び出し結果。例外を投げず常にこの形で返す */
export interface GeminiAnalyzeImageResponse {
  status: 'completed' | 'failed'
  result: AssignmentAnalysisResult | null
  error: ApiErrorInfo | null
}

/** APIキーの保存状態(キー自体の値は含めない) */
export interface GeminiKeyStatus {
  configured: boolean
}

/** APIキーの接続テスト結果 */
export interface GeminiKeyTestResult {
  ok: boolean
  message: string
}
