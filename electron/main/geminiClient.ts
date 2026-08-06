/**
 * このファイルは何をするファイルか:
 * Gemini APIへ画像を送り、課題の解析結果(`AssignmentAnalysisResult`と同じ形)を
 * 得るための処理をまとめたファイルです。バックエンドサーバーの代わりに、
 * mainプロセスがこの処理を直接実行します。
 *
 * このファイルの中でやっていること:
 * - `PROMPT`: 画像から課題情報を読み取らせるための指示文(相対日付の解決方法などを含む)
 * - `RESPONSE_SCHEMA`: Geminiに強制させるレスポンスのJSON Schema
 *   (`AssignmentAnalysisResult`と対応する形。自由記述による構造崩れを防ぐ)
 * - `analyzeImageWithGemini`: 画像バイト列とAPIキーを受け取り、Gemini APIを呼び出し、
 *   結果を`GeminiAnalyzeImageResponse`に変換して返す。例外は投げず、
 *   失敗時は`status: 'failed'`として返す
 * - `testApiKey`: 設定画面の「接続テスト」用に、ごく小さいリクエストで疎通確認する
 * - レスポンスは`zod`でスキーマ検証してから使う(既存のフォームバリデーションと同じzod ^3.24.1を利用)
 */

import { z } from 'zod'
import type { ApiErrorInfo, AssignmentAnalysisResult } from '@shared/types/api'
import type { GeminiAnalyzeImageResponse, GeminiKeyTestResult } from '@shared/types/gemini'

const MODEL = 'gemini-2.0-flash'
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const CONFIDENCE_ENUM = ['high', 'medium', 'low'] as const
const FIELD_KEYS = ['title', 'subject', 'deadline', 'submissionMethod', 'description'] as const

/** Geminiに渡す指示文。日付の基準と、迷った項目の扱い方を明示する */
function buildPrompt(): string {
  const today = new Date().toISOString().slice(0, 10)
  return [
    `今日の日付は${today}です。この画像は学生向けの宿題・課題の掲示、プリント、またはそのスクリーンショットです。`,
    '画像から読み取れる情報を指定のJSON形式で出力してください。',
    '締切が「来週金曜」のような相対的な表現の場合は、今日の日付を基準に絶対日付(ISO 8601)へ変換してください。',
    '締切の候補が複数考えられる場合はdeadlineCandidatesに列挙し、最も可能性が高いものをdeadlineに設定してください。',
    '画像から読み取れない項目はnullにしてください。曖昧・不確実な項目はambiguousFieldsに理由を書いてください。',
    'overallConfidenceとfieldConfidenceの各項目は必ずhigh/medium/lowのいずれかで埋めてください。',
    'duplicateCandidatesは常に空配列にしてください(既存タスクとの重複チェックはこの処理では行いません)。'
  ].join('\n')
}

/** Geminiに強制する、AssignmentAnalysisResultと対応するレスポンス構造 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    subject: { type: 'string', nullable: true },
    deadline: { type: 'string', nullable: true },
    deadlineCandidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          deadline: { type: 'string' },
          confidence: { type: 'string', enum: CONFIDENCE_ENUM }
        },
        required: ['deadline', 'confidence']
      }
    },
    submissionMethod: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
    overallConfidence: { type: 'string', enum: CONFIDENCE_ENUM },
    fieldConfidence: {
      type: 'object',
      properties: Object.fromEntries(
        FIELD_KEYS.map((key) => [key, { type: 'string', enum: CONFIDENCE_ENUM }])
      ),
      required: [...FIELD_KEYS]
    },
    ambiguousFields: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', enum: FIELD_KEYS },
          reason: { type: 'string' },
          candidates: { type: 'array', items: { type: 'string' } }
        },
        required: ['field', 'reason']
      }
    }
  },
  required: [
    'title',
    'subject',
    'deadline',
    'deadlineCandidates',
    'submissionMethod',
    'description',
    'overallConfidence',
    'fieldConfidence',
    'ambiguousFields'
  ]
} as const

// Geminiのレスポンスを検証するためのzodスキーマ(duplicateCandidatesはmain側で常に[]を補う)
const confidenceSchema = z.enum(CONFIDENCE_ENUM)
const geminiResultSchema = z.object({
  title: z.string().nullable(),
  subject: z.string().nullable(),
  deadline: z.string().nullable(),
  deadlineCandidates: z.array(z.object({ deadline: z.string(), confidence: confidenceSchema })),
  submissionMethod: z.string().nullable(),
  description: z.string().nullable(),
  overallConfidence: confidenceSchema,
  fieldConfidence: z.object({
    title: confidenceSchema,
    subject: confidenceSchema,
    deadline: confidenceSchema,
    submissionMethod: confidenceSchema,
    description: confidenceSchema
  }),
  ambiguousFields: z.array(
    z.object({
      field: z.enum(FIELD_KEYS),
      reason: z.string(),
      candidates: z.array(z.string()).optional()
    })
  )
})

function errorResponse(error: ApiErrorInfo): GeminiAnalyzeImageResponse {
  return { status: 'failed', result: null, error }
}

/** fetchのHTTPステータスから、アプリ共通のApiErrorInfoへ変換する */
function toErrorInfoFromStatus(status: number, bodyText: string): ApiErrorInfo {
  if (status === 401 || status === 403) {
    return { code: 'UNAUTHORIZED', message: 'Gemini APIキーが無効です。設定画面で確認してください。' }
  }
  if (status === 429) {
    return {
      code: 'SERVER_UNAVAILABLE',
      message: 'Gemini APIのレート制限に達しました。しばらく待ってから再度お試しください。'
    }
  }
  if (status >= 500) {
    return { code: 'SERVER_UNAVAILABLE', message: 'Gemini APIでエラーが発生しました。時間をおいて再度お試しください。' }
  }
  return { code: 'AI_ANALYSIS_FAILED', message: `Gemini APIの呼び出しに失敗しました(status ${status}): ${bodyText}` }
}

/** Gemini generateContent APIを呼び出し、レスポンス本文のJSON文字列部分を取り出す */
async function callGemini(apiKey: string, imagePart: { mimeType: string; data: string }): Promise<
  { ok: true; text: string } | { ok: false; error: ApiErrorInfo }
> {
  let response: Response
  try {
    response = await fetch(`${GENERATE_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inlineData: { mimeType: imagePart.mimeType, data: imagePart.data } },
              { text: buildPrompt() }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA
        }
      })
    })
  } catch {
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Gemini APIに接続できませんでした。ネットワーク接続を確認してください。' } }
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '')
    return { ok: false, error: toErrorInfoFromStatus(response.status, bodyText) }
  }

  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    return { ok: false, error: { code: 'AI_ANALYSIS_FAILED', message: 'Gemini APIから解析結果を取得できませんでした。' } }
  }
  return { ok: true, text }
}

/** 画像バイト列を、Geminiに送るBase64文字列へ変換する */
function toBase64(data: ArrayBuffer): string {
  return Buffer.from(data).toString('base64')
}

/** 画像をGeminiへ送って解析し、AssignmentAnalysisResult相当の結果を返す */
export async function analyzeImageWithGemini(
  apiKey: string | null,
  input: { data: ArrayBuffer; mimeType: string }
): Promise<GeminiAnalyzeImageResponse> {
  if (!apiKey) {
    return errorResponse({
      code: 'UNAUTHORIZED',
      message: 'Gemini APIキーが設定されていません。設定画面から登録してください。'
    })
  }

  const callResult = await callGemini(apiKey, { mimeType: input.mimeType, data: toBase64(input.data) })
  if (!callResult.ok) return errorResponse(callResult.error)

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(callResult.text)
  } catch {
    return errorResponse({ code: 'AI_ANALYSIS_FAILED', message: 'Gemini APIの応答をJSONとして解析できませんでした。' })
  }

  const parsed = geminiResultSchema.safeParse(parsedJson)
  if (!parsed.success) {
    return errorResponse({ code: 'AI_ANALYSIS_FAILED', message: 'Gemini APIの応答が期待した形式ではありませんでした。' })
  }

  const result: AssignmentAnalysisResult = { ...parsed.data, duplicateCandidates: [] }
  return { status: 'completed', result, error: null }
}

/** 設定画面の「接続テスト」用: ごく小さいリクエストでキーの有効性だけを確認する */
export async function testApiKey(apiKey: string): Promise<GeminiKeyTestResult> {
  try {
    const response = await fetch(`${GENERATE_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
    })
    if (response.ok) return { ok: true, message: 'Gemini APIに接続できました。' }
    if (response.status === 401 || response.status === 403) {
      return { ok: false, message: 'APIキーが無効です。' }
    }
    if (response.status === 429) {
      return { ok: false, message: 'レート制限に達しています。キー自体は有効な可能性があります。' }
    }
    return { ok: false, message: `接続に失敗しました(status ${response.status})。` }
  } catch {
    return { ok: false, message: 'ネットワークエラーにより接続を確認できませんでした。' }
  }
}
