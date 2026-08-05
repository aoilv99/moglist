/**
 * このファイルは何をするファイルか:
 * APIのエラーコード(`ApiErrorCode`)ごとに、画面へ表示する
 * 「アイコン・タイトル・説明文」を対応付ける表(マップ)を定義するファイルです。
 * `ErrorState` コンポーネントから使われ、エラーの種類に応じた分かりやすい表示を実現します。
 *
 * このファイルの中でやっていること:
 * - `ERROR_PRESENTATIONS`: 全13種類のエラーコードそれぞれに対する表示内容の対応表
 * - `getErrorPresentation`: エラーコードを渡すと対応する表示内容を返す。
 *   対応表に無いコードや`undefined`の場合は「不明なエラー」を返す
 */

import {
  AlertTriangle,
  CalendarX2,
  FileWarning,
  FileX2,
  HelpCircle,
  ScanText,
  ServerCrash,
  ShieldAlert,
  WifiOff,
  type LucideIcon
} from 'lucide-react'
import type { ApiErrorCode } from '@shared/types/api'

export interface ErrorPresentation {
  title: string
  description: string
  icon: LucideIcon
}

export const ERROR_PRESENTATIONS: Record<ApiErrorCode, ErrorPresentation> = {
  NETWORK_ERROR: {
    title: 'ネットワークエラー',
    description: 'インターネット接続を確認してください。',
    icon: WifiOff
  },
  SERVER_UNAVAILABLE: {
    title: 'サーバーに接続できません',
    description: 'APIサーバーが起動していないか、停止している可能性があります。',
    icon: ServerCrash
  },
  UNSUPPORTED_FILE_TYPE: {
    title: '対応していないファイル形式です',
    description: 'PNG・JPG・JPEG・WEBP形式の画像を使用してください。',
    icon: FileWarning
  },
  FILE_TOO_LARGE: {
    title: 'ファイルサイズが大きすぎます',
    description: '最大10MBまでの画像を使用してください。',
    icon: FileX2
  },
  OCR_FAILED: {
    title: '文字を読み取れませんでした',
    description: '画像が不鮮明な可能性があります。鮮明な画像で再度お試しください。',
    icon: ScanText
  },
  DEADLINE_NOT_DETECTED: {
    title: '締切日を検出できませんでした',
    description: '手動で締切日を入力してください。',
    icon: AlertTriangle
  },
  AI_ANALYSIS_FAILED: {
    title: 'AI解析に失敗しました',
    description: '時間をおいて再度お試しください。',
    icon: AlertTriangle
  },
  TASK_CREATE_FAILED: {
    title: '課題の登録に失敗しました',
    description: '入力内容を確認し、もう一度お試しください。',
    icon: AlertTriangle
  },
  CALENDAR_SYNC_FAILED: {
    title: 'カレンダー連携に失敗しました',
    description: '課題自体は登録されています。後で再連携をお試しください。',
    icon: CalendarX2
  },
  VALIDATION_ERROR: {
    title: '入力内容に誤りがあります',
    description: '入力項目を確認してください。',
    icon: AlertTriangle
  },
  NOT_FOUND: {
    title: 'データが見つかりません',
    description: '対象のデータは削除された可能性があります。',
    icon: HelpCircle
  },
  UNAUTHORIZED: {
    title: '認証が必要です',
    description: 'ログイン状態を確認してください。',
    icon: ShieldAlert
  },
  UNKNOWN_ERROR: {
    title: '不明なエラーが発生しました',
    description: '時間をおいて再度お試しください。',
    icon: HelpCircle
  }
}

/** エラーコードから表示内容を取得する。不明なコードや未指定の場合は「不明なエラー」を返す */
export function getErrorPresentation(code: ApiErrorCode | undefined): ErrorPresentation {
  if (!code) return ERROR_PRESENTATIONS.UNKNOWN_ERROR
  return ERROR_PRESENTATIONS[code] ?? ERROR_PRESENTATIONS.UNKNOWN_ERROR
}
