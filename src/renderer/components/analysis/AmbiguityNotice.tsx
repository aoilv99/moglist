/**
 * このファイルは何をするファイルか:
 * AIが解析時に「自信が持てなかった項目」を、警告として表示するコンポーネントです。
 * 締切日が複数候補ある場合は、候補ボタンをクリックしてフォームへ反映できます。
 *
 * このファイルの中でやっていること:
 * - 曖昧な項目が1つも無ければ何も表示しない(null を返す)
 * - 各曖昧項目について、日本語ラベルと「なぜ曖昧なのか」の理由を一覧表示する
 * - 締切候補が2件以上ある場合、候補を日時のボタンとして並べる
 * - 候補ボタンが押されたら `onSelectDeadlineCandidate` を呼び、
 *   呼び出し元(AnalysisReviewForm)がフォームの日付欄を書き換える
 */

import { format, parseISO } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import type { AmbiguousField, AnalysisFieldKey, DeadlineCandidate } from '@shared/types/api'

// 項目キー(英語)を日本語ラベルに変換する対応表
const FIELD_LABEL: Record<AnalysisFieldKey, string> = {
  title: '課題名',
  subject: '科目名',
  deadline: '提出期限',
  submissionMethod: '提出方法',
  description: '説明'
}

interface AmbiguityNoticeProps {
  ambiguousFields: AmbiguousField[]
  deadlineCandidates?: DeadlineCandidate[]
  onSelectDeadlineCandidate?: (isoDeadline: string) => void
}

export function AmbiguityNotice({
  ambiguousFields,
  deadlineCandidates,
  onSelectDeadlineCandidate
}: AmbiguityNoticeProps): JSX.Element | null {
  // 曖昧な項目が無ければ、警告ボックス自体を表示しない
  if (ambiguousFields.length === 0) return null

  return (
    <div className="space-y-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-warning">
        <AlertTriangle className="h-4 w-4" />
        AIが判断に迷った項目があります
      </div>
      <ul className="space-y-2 text-sm text-text-base">
        {ambiguousFields.map((field) => (
          <li key={field.field}>
            <span className="font-medium">{FIELD_LABEL[field.field]}：</span>
            <span className="text-muted">{field.reason}</span>
          </li>
        ))}
      </ul>
      {/* 締切候補が2件以上あり、選択用のコールバックが渡されている場合だけ候補ボタンを表示する */}
      {deadlineCandidates && deadlineCandidates.length > 1 && onSelectDeadlineCandidate && (
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="w-full text-xs text-muted">締切候補から選択：</span>
          {deadlineCandidates.map((candidate) => (
            <button
              key={candidate.deadline}
              type="button"
              onClick={() => onSelectDeadlineCandidate(candidate.deadline)}
              className="rounded-full border border-warning/40 bg-surface px-3 py-1 text-xs text-text-base transition hover:bg-warning/10"
            >
              {format(parseISO(candidate.deadline), 'M月d日 HH:mm')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
