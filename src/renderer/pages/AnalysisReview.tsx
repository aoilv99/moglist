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
  const [completedTask, setCompletedTask] = useState<Task | null>(null)

  const analysis = currentAnalysis && currentAnalysis.id === analysisId ? currentAnalysis : null

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
          setCompletedTask(task)
          setPendingImage(null)
        },
        onError: () => {
          showToast('課題の登録に失敗しました。もう一度お試しください。', 'error')
        }
      }
    )
  }

  const handleRetryAnalysis = (): void => {
    retryMutation.mutate(analysis.id, {
      onSuccess: (updated) => {
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
