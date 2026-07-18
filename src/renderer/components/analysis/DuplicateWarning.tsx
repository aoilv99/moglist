/**
 * このファイルは何をするファイルか:
 * 解析した課題と「そっくりな既存課題」が見つかった時に、警告として一覧表示する
 * コンポーネントです。重複登録に気づきやすくするための表示で、登録自体はブロックしません。
 *
 * このファイルの中でやっていること:
 * - 重複候補が1件も無ければ何も表示しない(null を返す)
 * - 各候補について、課題名・科目名・締切・類似度(%)を一覧表示する
 */

import { format, parseISO } from 'date-fns'
import { Copy } from 'lucide-react'
import type { DuplicateCandidateTask } from '@shared/types/api'

export function DuplicateWarning({
  candidates
}: {
  candidates: DuplicateCandidateTask[]
}): JSX.Element | null {
  // 重複候補が無ければ、警告ボックス自体を表示しない
  if (candidates.length === 0) return null

  return (
    <div className="space-y-2 rounded-2xl border border-danger/30 bg-danger/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-danger">
        <Copy className="h-4 w-4" />
        似た課題がすでに登録されています
      </div>
      <ul className="space-y-1.5 text-sm">
        {candidates.map((candidate) => (
          <li
            key={candidate.taskId}
            className="flex items-center justify-between rounded-xl bg-surface px-3 py-2"
          >
            <div>
              <p className="font-medium text-text-base">{candidate.title}</p>
              <p className="text-xs text-muted">
                {candidate.subject ?? '科目未設定'}
                {candidate.deadline &&
                  ` ・ ${format(parseISO(candidate.deadline), 'M月d日 HH:mm')}まで`}
              </p>
            </div>
            {/* 類似度(0.0〜1.0)を百分率(%)に変換して表示する */}
            <span className="shrink-0 text-xs font-medium text-danger">
              類似度 {Math.round(candidate.similarity * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
