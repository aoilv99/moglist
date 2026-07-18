/**
 * このファイルは何をするファイルか:
 * 解析結果確認画面(ルート `/review/:analysisId`)を表示するページコンポーネントです。
 * AIの解析結果を表示・編集し、「登録する」ボタンで実際の課題として登録する
 * 一連の流れ(確認→登録→完了)をこの1画面の中で完結させています。
 *
 * このファイルの中でやっていること:
 * - URLの `analysisId` と、ストアに保存されている `currentAnalysis` を突き合わせ、
 *   一致していれば解析結果を表示する。一致しない(=結果が無い、ウィンドウ再読み込み等で
 *   消えた)場合は「見つかりません」という案内を表示する
 * - `completedTask` が設定されたら、フォームの代わりに「登録完了」画面を表示する
 *   (別ルートへ移動せず、同じ画面内で状態を切り替えて完了画面にしている)
 * - `handleSubmit`: フォームの入力値から `CreateTaskInput` を組み立てて課題を登録する。
 *   登録に成功したら完了画面へ切り替え、待機中の画像もクリアする
 * - `handleRetryAnalysis`: 「もう一度解析」ボタンで再解析を実行し、
 *   結果をストアに保存し直す(フォームは新しい結果で自動的に再初期化される)
 * - 登録・再解析の成功/失敗を、トースト通知でユーザーに知らせる
 */

import { CheckCircle2, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Task } from '@shared/types/api'
import { AnalysisReviewForm } from '@renderer/components/analysis/AnalysisReviewForm'
import { EmptyState } from '@renderer/components/feedback/EmptyState'
import { useToast } from '@renderer/components/feedback/ToastProvider'
import { CalendarSyncBadge } from '@renderer/components/task/CalendarSyncBadge'
import { mapAnalysisResultToFormValues } from '@renderer/features/analysis/mapAnalysisToFormValues'
import { useRetryAnalysis } from '@renderer/hooks/useAnalysis'
import { useCreateTask } from '@renderer/hooks/useTaskMutations'
import { combineDeadline } from '@renderer/lib/deadline'
import type { TaskFormValues } from '@renderer/schemas/taskForm'
import { useAnalysisStore } from '@renderer/stores/analysisStore'
import { usePendingImageStore } from '@renderer/stores/pendingImageStore'

export function AnalysisReview(): JSX.Element {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const currentAnalysis = useAnalysisStore((state) => state.currentAnalysis)
  const setCurrentAnalysis = useAnalysisStore((state) => state.setCurrentAnalysis)
  const setPendingImage = usePendingImageStore((state) => state.setPendingImage)
  const createTaskMutation = useCreateTask()
  const retryMutation = useRetryAnalysis()
  // 登録が完了した課題(まだnullなら未登録=フォーム表示中)
  const [completedTask, setCompletedTask] = useState<Task | null>(null)

  // URLのIDとストアに保存されている解析結果のIDが一致する時だけ、その結果を使う
  const analysis = currentAnalysis && currentAnalysis.id === analysisId ? currentAnalysis : null

  // 解析結果が見つからない場合(リロード等でストアの中身が消えた場合)の表示
  if (!analysis) {
    return (
      <EmptyState
        icon={ImageOff}
        title="解析結果が見つかりません"
        description="この解析結果は保持されていません。もう一度スクショまたはドラッグ＆ドロップで取得し直してください。"
        action={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white"
          >
            ダッシュボードへ戻る
          </button>
        }
      />
    )
  }

  // 登録が完了していれば、フォームの代わりに完了画面を表示する
  if (completedTask) {
    return (
      <div className="mx-auto mt-10 max-w-md space-y-5 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <div>
          <p className="text-lg font-semibold text-text-base">課題を登録しました！</p>
          <p className="mt-1 text-sm text-muted">「{completedTask.title}」を課題一覧に追加しました。</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <CalendarSyncBadge sync={completedTask.calendarSync} />
          {/* カレンダー連携だけ失敗した場合も、課題登録自体は成功として表示する(仕様通り) */}
          {completedTask.calendarSync?.status === 'failed' && (
            <p className="text-xs text-danger">{completedTask.calendarSync.error?.message}</p>
          )}
        </div>
        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full px-5 py-2 text-sm text-muted transition hover:bg-background"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            課題一覧を見る
          </button>
        </div>
      </div>
    )
  }

  // フォームの「登録する」が押された時の処理
  const handleSubmit = (values: TaskFormValues): void => {
    createTaskMutation.mutate(
      {
        title: values.title,
        subject: values.subject || undefined,
        deadline: combineDeadline(values.deadlineDate, values.deadlineTime),
        submissionMethod: values.submissionMethod || undefined,
        description: values.description || undefined,
        sourceImageUrl: analysis.sourceImageUrl,
        analysisId: analysis.id
      },
      {
        onSuccess: (task) => {
          // 完了状態に切り替え、待機中だった画像の情報もクリアしておく
          setCompletedTask(task)
          setPendingImage(null)
        },
        onError: () => {
          showToast('課題の登録に失敗しました。もう一度お試しください。', 'error')
        }
      }
    )
  }

  // フォームの「もう一度解析」が押された時の処理
  const handleRetryAnalysis = (): void => {
    retryMutation.mutate(analysis.id, {
      onSuccess: (updated) => {
        // 新しい解析結果でストアを更新する。AnalysisReviewFormが自動的にフォームを作り直す
        setCurrentAnalysis(updated)
        showToast('もう一度解析しました。', 'success')
      },
      onError: () => {
        showToast('再解析に失敗しました。', 'error')
      }
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text-base">解析結果の確認</h1>
      <AnalysisReviewForm
        analysis={analysis}
        defaultValues={mapAnalysisResultToFormValues(analysis.result)}
        isSubmitting={createTaskMutation.isPending}
        isRetrying={retryMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
        onRetryAnalysis={handleRetryAnalysis}
      />
    </div>
  )
}
