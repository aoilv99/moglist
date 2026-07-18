import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfidenceIndicator } from '@renderer/components/analysis/ConfidenceIndicator'
import { ConfirmDialog } from '@renderer/components/feedback/ConfirmDialog'
import { ErrorState } from '@renderer/components/feedback/ErrorState'
import { LoadingState } from '@renderer/components/feedback/LoadingState'
import { useToast } from '@renderer/components/feedback/ToastProvider'
import { CalendarSyncBadge } from '@renderer/components/task/CalendarSyncBadge'
import { useTask } from '@renderer/hooks/useTask'
import { useDeleteTask, useUpdateTask, useUpdateTaskStatus } from '@renderer/hooks/useTaskMutations'
import { combineDeadline, splitDeadline } from '@renderer/lib/deadline'
import { taskFormSchema, type TaskFormValues } from '@renderer/schemas/taskForm'

const inputClass =
  'w-full rounded-xl border border-secondary/50 bg-surface px-3 py-2 text-sm text-text-base focus:border-primary focus:outline-none'

export function TaskDetail(): JSX.Element {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: task, isLoading, isError, error, refetch } = useTask(taskId)
  const updateTaskMutation = useUpdateTask(taskId ?? '')
  const deleteTaskMutation = useDeleteTask()
  const updateStatusMutation = useUpdateTaskStatus()
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      deadlineDate: '',
      deadlineTime: '23:59',
      submissionMethod: '',
      description: ''
    }
  })

  if (isLoading) return <LoadingState label="課題を読み込み中…" />
  if (isError || !task) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        onCancel={() => navigate('/tasks')}
        cancelLabel="一覧に戻る"
      />
    )
  }

  const startEditing = (): void => {
    const { date, time } = splitDeadline(task.deadline)
    reset({
      title: task.title,
      subject: task.subject ?? '',
      deadlineDate: date,
      deadlineTime: time,
      submissionMethod: task.submissionMethod ?? '',
      description: task.description ?? ''
    })
    setIsEditing(true)
  }

  const handleSave = (values: TaskFormValues): void => {
    updateTaskMutation.mutate(
      {
        title: values.title,
        subject: values.subject || undefined,
        deadline: combineDeadline(values.deadlineDate, values.deadlineTime),
        submissionMethod: values.submissionMethod || undefined,
        description: values.description || undefined
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          showToast('課題を更新しました。', 'success')
        },
        onError: () => showToast('更新に失敗しました。もう一度お試しください。', 'error')
      }
    )
  }

  const handleToggleStatus = (): void => {
    updateStatusMutation.mutate({
      taskId: task.id,
      status: task.status === 'completed' ? 'incomplete' : 'completed'
    })
  }

  const handleDelete = (): void => {
    setConfirmDeleteOpen(false)
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        showToast('課題を削除しました。', 'success')
        navigate('/tasks')
      },
      onError: () => showToast('削除に失敗しました。もう一度お試しください。', 'error')
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-base">{task.title}</h1>
          <p className="mt-1 text-sm text-muted">{task.subject ?? '科目未設定'}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggleStatus}
            className="flex items-center gap-1.5 rounded-full border border-secondary/50 px-3 py-1.5 text-xs font-medium text-text-base transition hover:bg-background"
          >
            {task.status === 'completed' ? (
              <Circle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {task.status === 'completed' ? '未完了に戻す' : '完了にする'}
          </button>
          <button
            type="button"
            onClick={startEditing}
            className="flex items-center gap-1.5 rounded-full border border-secondary/50 px-3 py-1.5 text-xs font-medium text-text-base transition hover:bg-background"
          >
            <Pencil className="h-3.5 w-3.5" />
            編集
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            削除
          </button>
        </div>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit(handleSave)}
          className="space-y-4 rounded-2xl border border-secondary/30 bg-surface p-5"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-text-base">課題名</label>
            <input {...register('title')} className={inputClass} />
            {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-base">科目名</label>
            <input {...register('subject')} className={inputClass} />
            {errors.subject && <p className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-text-base">提出期限（日付）</label>
              <input type="date" {...register('deadlineDate')} className={inputClass} />
              {errors.deadlineDate && (
                <p className="mt-1 text-xs text-danger">{errors.deadlineDate.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-base">時刻</label>
              <input type="time" {...register('deadlineTime')} className={inputClass} />
              {errors.deadlineTime && (
                <p className="mt-1 text-xs text-danger">{errors.deadlineTime.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-base">提出方法</label>
            <input {...register('submissionMethod')} className={inputClass} />
            {errors.submissionMethod && (
              <p className="mt-1 text-xs text-danger">{errors.submissionMethod.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-base">説明</label>
            <textarea {...register('description')} rows={4} className={inputClass} />
            {errors.description && (
              <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-secondary/30 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full px-5 py-2 text-sm text-muted transition hover:bg-background"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {updateTaskMutation.isPending ? '保存中…' : '保存する'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 rounded-2xl border border-secondary/30 bg-surface p-5">
          <DetailRow label="提出期限" value={format(parseISO(task.deadline), 'yyyy年M月d日 HH:mm')} />
          <DetailRow label="提出方法" value={task.submissionMethod ?? '未設定'} />
          <DetailRow label="説明" value={task.description ?? '未設定'} multiline />
        </div>
      )}

      {task.sourceImageUrl && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-text-base">元画像</p>
          <img
            src={task.sourceImageUrl}
            alt="元画像"
            className="max-h-72 rounded-2xl border border-secondary/40 object-contain"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-secondary/30 bg-surface p-5 text-sm">
        <div>
          <p className="text-muted">登録日時</p>
          <p className="text-text-base">{format(parseISO(task.createdAt), 'yyyy年M月d日 HH:mm')}</p>
        </div>
        <div>
          <p className="text-muted">更新日時</p>
          <p className="text-text-base">{format(parseISO(task.updatedAt), 'yyyy年M月d日 HH:mm')}</p>
        </div>
        <div>
          <p className="mb-1 text-muted">カレンダー連携状態</p>
          <CalendarSyncBadge sync={task.calendarSync} />
        </div>
        <div>
          <p className="mb-1 text-muted">AI解析結果 / 抽出精度</p>
          {task.confidence ? (
            <ConfidenceIndicator level={task.confidence} />
          ) : (
            <span className="text-xs text-muted">手動登録（AI解析なし）</span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="この課題を削除しますか？"
        description="削除すると元に戻せません。"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  )
}

function DetailRow({
  label,
  value,
  multiline
}: {
  label: string
  value: string
  multiline?: boolean
}): JSX.Element {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-sm text-text-base ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value}</p>
    </div>
  )
}
