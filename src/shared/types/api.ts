/**
 * このファイルは何をするファイルか:
 * フロントエンドとバックエンドの「共通の型定義」を1箇所にまとめたファイルです。
 * API related types shared between the frontend and backend teams.
 * This file is the single source of truth for API shapes — do not
 * redeclare similar types elsewhere in the renderer.
 * (日本語訳: フロントエンドとバックエンドで共有するAPI関連の型です。
 *  このファイルがAPIの形を決める唯一の正解であり、画面側で似た型を
 *  別に作り直さないでください)
 *
 * このファイルの中でやっていること:
 * - 課題の解析結果(AssignmentAnalysis)、課題(Task)、一覧取得の条件(TaskListQuery)、
 *   ヘルスチェック(ApiHealth)、エラー形式(ApiErrorInfo)などの「型」だけを定義している
 * - 実際の処理ロジックはなく、TypeScriptの型注釈として使われる
 * - 唯一の例外として、エラーを投げるための`ApiError`クラスだけ実際の処理を持つ
 * - バックエンド担当者向けの仕様書(BACKEND_HANDOFF.md)は、この型定義と一致させている
 */

// 解析結果の「確からしさ」を表す3段階のレベル
export type ConfidenceLevel = 'high' | 'medium' | 'low'

// 課題画像の解析処理そのものの状態(完了/失敗/処理中)
export type AssignmentAnalysisStatus = 'completed' | 'failed' | 'processing'

// 解析結果の中で「曖昧」「精度」の対象になりうる項目名
export type AnalysisFieldKey =
  | 'title'
  | 'subject'
  | 'deadline'
  | 'submissionMethod'
  | 'description'

// AIが「この項目はちょっと自信がない」と判断した項目の情報
export interface AmbiguousField {
  field: AnalysisFieldKey
  reason: string // なぜ曖昧だと判断したかの説明文
  candidates?: string[] // 候補がある場合(締切日の候補など)
}

// 締切日時の「候補」1件分(複数の候補がある場合に使う)
export interface DeadlineCandidate {
  /** ISO 8601 datetime string */
  deadline: string
  confidence: ConfidenceLevel
}

// 「もしかしたら既に登録済みかもしれない」重複候補となる既存課題の情報
export interface DuplicateCandidateTask {
  taskId: string
  title: string
  subject: string | null
  /** ISO 8601 datetime string, null if unknown */
  deadline: string | null
  /** 0.0-1.0 similarity score (類似度。1.0に近いほどそっくり) */
  similarity: number
}

// 画像解析APIが返す「解析結果の中身」(課題名・科目名・締切など全部入り)
export interface AssignmentAnalysisResult {
  title: string | null
  subject: string | null
  /** ISO 8601 datetime string, best-guess resolved deadline */
  deadline: string | null
  deadlineCandidates: DeadlineCandidate[]
  submissionMethod: string | null
  description: string | null
  overallConfidence: ConfidenceLevel // 全体としての確からしさ
  fieldConfidence: Record<AnalysisFieldKey, ConfidenceLevel> // 項目ごとの確からしさ
  ambiguousFields: AmbiguousField[] // AIが迷った項目の一覧
  duplicateCandidates: DuplicateCandidateTask[] // 重複の可能性がある既存課題
}

// 画像解析APIのレスポンス全体(結果そのものに加えて、状態やエラー情報も含む)
export interface AssignmentAnalysis {
  id: string
  status: AssignmentAnalysisStatus
  /** URL (or file://) of the source screenshot image */
  sourceImageUrl: string
  createdAt: string
  result: AssignmentAnalysisResult | null // status !== 'completed' の場合はnull
  error: ApiErrorInfo | null // status === 'failed' の場合のみ値が入る
}

// 課題の完了状態(未完了 or 完了)
export type TaskStatus = 'incomplete' | 'completed'

// 外部カレンダーとの連携状態
export type CalendarSyncStatus = 'not_synced' | 'synced' | 'failed'

// カレンダー連携の結果情報
export interface CalendarSyncResult {
  status: CalendarSyncStatus
  provider?: string // 連携先の名前(例: "Google Calendar")
  eventUrl?: string | null
  syncedAt?: string | null
  error?: ApiErrorInfo | null
}

// 課題1件分のデータ構造(一覧・詳細画面などで共通して使う)
export interface Task {
  id: string
  title: string
  subject: string | null
  /** ISO 8601 datetime string */
  deadline: string
  submissionMethod: string | null
  description: string | null
  status: TaskStatus
  sourceImageUrl: string | null
  analysisId: string | null // どの解析結果から作られた課題かの紐付け
  confidence: ConfidenceLevel | null // 手動登録の場合はnull
  calendarSync: CalendarSyncResult | null
  createdAt: string
  updatedAt: string
}

// 課題を新規作成する時にAPIへ送るデータの形
export interface CreateTaskInput {
  title: string
  subject?: string
  /** ISO 8601 datetime string */
  deadline: string
  submissionMethod?: string
  description?: string
  sourceImageUrl?: string
  analysisId?: string
}

// 課題を更新する時に送るデータの形(全項目が任意=一部だけ更新できる)
export type UpdateTaskInput = Partial<CreateTaskInput>

// 課題一覧の並び替え方法
export type TaskSortKey = 'deadlineAsc' | 'createdAtDesc' | 'subject'

// 課題一覧のフィルタ条件(すべて/未完了/完了/期限切れ/今日/今週)
export type TaskFilterKey = 'all' | 'incomplete' | 'completed' | 'overdue' | 'today' | 'thisWeek'

// 課題一覧を取得する時に指定できるクエリパラメータ
export interface TaskListQuery {
  filter?: TaskFilterKey
  sort?: TaskSortKey
  search?: string
  page?: number
  pageSize?: number
}

// 課題一覧APIのレスポンス(課題配列 + ページ情報)
export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  pageSize: number
}

// APIサーバーの稼働状態(正常/不安定/停止)
export type ApiHealthStatus = 'ok' | 'degraded' | 'down'

// ヘルスチェックAPIのレスポンス。ダッシュボード等の接続状態表示に使う
export interface ApiHealth {
  status: ApiHealthStatus
  version: string
  mode: 'mock' | 'live' // モックAPIか実APIかを表す
  checkedAt: string
}

// APIエラーの種類を表すコード一覧。画面側はこのコードでエラーメッセージを出し分ける
export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'SERVER_UNAVAILABLE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'OCR_FAILED'
  | 'DEADLINE_NOT_DETECTED'
  | 'AI_ANALYSIS_FAILED'
  | 'TASK_CREATE_FAILED'
  | 'CALENDAR_SYNC_FAILED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'UNKNOWN_ERROR'

// エラー1件分の情報(コード・メッセージ・詳細)
export interface ApiErrorInfo {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

// バックエンドがエラー時に返すレスポンスの共通形式
export interface ApiErrorResponse {
  error: ApiErrorInfo
}

/**
 * Thrown by the service layer so callers can branch on `error.code`.
 * (日本語訳: APIサービス層がエラー時に投げる例外クラス。呼び出し側は
 *  `error.code` を見て、エラーの種類ごとに処理を分岐できる)
 */
export class ApiError extends Error {
  code: ApiErrorCode
  details?: Record<string, unknown>

  constructor(info: ApiErrorInfo) {
    super(info.message)
    this.name = 'ApiError'
    this.code = info.code
    this.details = info.details
  }
}
