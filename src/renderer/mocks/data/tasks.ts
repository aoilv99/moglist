/**
 * このファイルは何をするファイルか:
 * モックAPIが最初から表示する「初期の課題データ」5件分を定義するファイルです。
 * ダッシュボード・課題一覧をモックモードで開いた時に、最初から何かデータが
 * 見えるようにするためのサンプルです(空っぽの状態を避けるため)。
 *
 * このファイルの中でやっていること:
 * - `buildTask`: 課題データの「よく使う既定値」(未完了・カレンダー連携済み等)を
 *   あらかじめ設定しておき、個別の課題ごとの差分(overrides)だけを渡せば
 *   1件のTaskオブジェクトが作れるようにするヘルパー関数
 * - `INITIAL_MOCK_TASKS`: 実際に使う5件の初期データ
 *   - 今日締切・数日後締切・期限切れ・カレンダー連携失敗・完了済み、など
 *     さまざまなパターンを1つずつ含めることで、画面の見た目を確認しやすくしている
 */

import type { Task } from '@shared/types/api'
import { deadlineAt, nowIso } from './dateHelpers'
import { buildPlaceholderScreenshotDataUrl } from './placeholderImage'

/** 課題データのよくある既定値を埋めつつ、個別の差分だけを上書きして1件作るヘルパー */
function buildTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title' | 'deadline'>): Task {
  const now = nowIso()
  return {
    subject: null,
    submissionMethod: null,
    description: null,
    status: 'incomplete',
    sourceImageUrl: null,
    analysisId: null,
    confidence: null,
    calendarSync: { status: 'synced', provider: 'Google Calendar', syncedAt: now },
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}

export const INITIAL_MOCK_TASKS: Task[] = [
  // 今日が締切の課題
  buildTask({
    id: 'mock-task-1',
    title: '線形代数 演習プリント提出',
    subject: '線形代数',
    deadline: deadlineAt(0, 23, 59),
    submissionMethod: '授業内で提出',
    description: '第6章の演習問題1〜10を解いて提出する。',
    confidence: 'high',
    sourceImageUrl: buildPlaceholderScreenshotDataUrl('線形代数 演習プリント')
  }),
  // 数日後が締切の課題
  buildTask({
    id: 'mock-task-2',
    title: 'データ構造とアルゴリズム 第5回レポート',
    subject: '情報科学演習',
    deadline: deadlineAt(4, 23, 59),
    submissionMethod: 'LMS（Moodle）経由で提出',
    description: '二分探索木の実装と計算量の考察をレポートにまとめて提出すること。',
    confidence: 'high',
    sourceImageUrl: buildPlaceholderScreenshotDataUrl('アルゴリズム第5回レポート')
  }),
  // カレンダー連携に失敗しているケース
  buildTask({
    id: 'mock-task-3',
    title: '英語プレゼンテーション課題',
    subject: '英語コミュニケーション',
    deadline: deadlineAt(2, 23, 59),
    submissionMethod: '授業内で発表',
    confidence: 'medium',
    calendarSync: {
      status: 'failed',
      error: {
        code: 'CALENDAR_SYNC_FAILED',
        message: 'カレンダーサービスへの接続に失敗しました。'
      }
    }
  }),
  // 締切を過ぎている(期限切れ)課題
  buildTask({
    id: 'mock-task-4',
    title: '基礎化学 実験レポート',
    subject: '基礎化学',
    deadline: deadlineAt(-2, 23, 59),
    submissionMethod: '実験レポート用紙を提出',
    confidence: 'low'
  }),
  // 完了済みの課題
  buildTask({
    id: 'mock-task-5',
    title: '経済学基礎 期末課題',
    subject: '経済学基礎',
    deadline: deadlineAt(10, 23, 59),
    submissionMethod: 'メールで提出',
    status: 'completed',
    confidence: 'medium'
  })
]
