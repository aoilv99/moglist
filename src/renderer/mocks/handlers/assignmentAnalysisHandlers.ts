/**
 * このファイルは何をするファイルか:
 * モックモード時に、画像解析API(`analyzeAssignmentImage` / `retryAnalysis`)の
 * 「本物っぽい」応答を返すハンドラ関数をまとめたファイルです。
 * 実際にはネットワーク通信を行わず、`mocks/data/analyses.ts` のサンプルデータを返します。
 *
 * このファイルの中でやっていること:
 * - `delay`: 実際のAPIらしく感じられるよう、わざと900ミリ秒待ってから応答する
 * - `buildScenarioAnalysis`: 現在選択中のモックシナリオ(`mockSettingsStore`)を見て、
 *   対応するサンプルデータを返す。シナリオが「API全体が失敗」の場合はエラーを投げる
 * - `mockAnalyzeAssignmentImage`: 新規解析のモック。呼び出すたびに新しい解析IDを発行する
 * - `mockRetryAnalysis`: 再解析のモック。渡された既存の解析IDをそのまま使う
 */

import { ApiError, type AssignmentAnalysis } from '@shared/types/api'
import { useMockSettingsStore } from '@renderer/stores/mockSettingsStore'
import { MOCK_ANALYSES } from '../data/analyses'

/** 指定したミリ秒だけ待つ(本物のAPI通信のような遅延を演出するため) */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 現在選択中のモックシナリオに応じた解析結果を組み立てる */
function buildScenarioAnalysis(analysisId: string): AssignmentAnalysis {
  const mockCase = useMockSettingsStore.getState().mockAnalysisCase
  // 「API全体が失敗」のシナリオが選ばれている場合は、通信エラーを模してエラーを投げる
  if (mockCase === 'api_failure') {
    throw new ApiError({
      code: 'AI_ANALYSIS_FAILED',
      message: 'AI解析サーバーに接続できませんでした。時間をおいて再度お試しください。'
    })
  }
  const template = MOCK_ANALYSES[mockCase]
  // テンプレートのIDと作成日時だけを、今回呼び出された分の値に差し替えて返す
  return { ...template, id: analysisId, createdAt: new Date().toISOString() }
}

/** analyzeAssignmentImage(実API)のモック版。呼び出すたびに新しい解析IDを発行する */
export async function mockAnalyzeAssignmentImage(_file: File): Promise<AssignmentAnalysis> {
  await delay(900)
  return buildScenarioAnalysis(`mock-analysis-${Date.now()}`)
}

/** retryAnalysis(実API)のモック版。渡された解析IDをそのまま使う */
export async function mockRetryAnalysis(analysisId: string): Promise<AssignmentAnalysis> {
  await delay(900)
  return buildScenarioAnalysis(analysisId)
}
