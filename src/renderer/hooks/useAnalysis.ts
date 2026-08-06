/**
 * このファイルは何をするファイルか:
 * 画像のAI解析に関する2つの操作(新規解析・再解析)を行うためのTanStack Query
 * ミューテーション(データを変更・実行する系の操作)フックをまとめたファイルです。
 *
 * このファイルの中でやっていること:
 * - `useAnalyzeImage()`: 画像ファイルを渡して解析を実行する(解析中画面AnalyzingPageで使用)
 * - `useRetryAnalysis()`: 既存の解析IDに対して、もう一度解析をやり直す
 *   (解析結果確認画面AnalysisReviewの「もう一度解析」ボタンで使用)
 * - どちらも `mutateAsync` を呼び出せば、Promiseとして結果を直接受け取れる
 */

import { useMutation } from '@tanstack/react-query'
import { analyzeAssignmentImage, retryAnalysis } from '@renderer/services/api/assignmentAnalysisApi'

export function useAnalyzeImage() {
  return useMutation({
    mutationFn: (file: File) => analyzeAssignmentImage(file)
  })
}

export function useRetryAnalysis() {
  return useMutation({
    mutationFn: (analysisId: string) => retryAnalysis(analysisId)
  })
}
