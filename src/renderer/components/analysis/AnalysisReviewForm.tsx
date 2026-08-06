/**
 * このファイルは何をするファイルか:
 * 解析結果確認画面(/review/:analysisId)の中心となる、フォーム部分のコンポーネントです。
 * AIの解析結果を初期値として、ユーザーが課題名・科目名・締切等を確認・修正できます。
 *
 * このファイルの中でやっていること:
 * - React Hook Form(`useForm`)でフォームの状態管理を行い、Zodスキーマ(taskFormSchema)で
 *   入力値のバリデーションを行う
 * - 解析結果(defaultValues)が変わったら、`reset()` でフォームの内容を最新化する
 *   (「もう一度解析」で新しい結果が来た時に反映されるようにするため)
 * - 元画像プレビュー・全体精度・曖昧項目の警告・重複候補の警告を表示する
 * - 各入力欄の横に、その項目のAI解析精度(高/中/低)バッジを表示する
 * - 締切候補ボタンが押された時、フォームの日付・時刻欄を書き換える
 * - 登録ボタンのラベルを、フォームが編集されたかどうか(isDirty)で
 *   「登録する」/「修正して登録」に自動的に出し分ける
 * - 「キャンセル」「もう一度解析」「登録する」の3つのボタンを表示する
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { AssignmentAnalysis } from '@shared/types/api'
import { splitDeadline } from '@renderer/lib/deadline'
import { taskFormSchema, type TaskFormValues } from '@renderer/schemas/taskForm'
import { AmbiguityNotice } from './AmbiguityNotice'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { DuplicateWarning } from './DuplicateWarning'
import { ImagePreview } from './ImagePreview'

// 入力欄(input/textarea)に共通で使うTailwindクラスを1つの変数にまとめておく
const inputClass =
  'w-full rounded-xl border border-secondary/50 bg-surface px-3 py-2 text-sm text-text-base focus:border-primary focus:outline-none'

interface AnalysisReviewFormProps {
  analysis: AssignmentAnalysis
  defaultValues: TaskFormValues
  isSubmitting: boolean
  isRetrying: boolean
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
  onRetryAnalysis: () => void
}

export function AnalysisReviewForm({
  analysis,
  defaultValues,
  isSubmitting,
  isRetrying,
  onSubmit,
  onCancel,
  onRetryAnalysis
}: AnalysisReviewFormProps): JSX.Element {
  const {
    register, // 各入力欄をフォームに登録するための関数
    handleSubmit, // 送信時にバリデーションしてからonSubmitを呼ぶラッパー
    reset, // フォームの値をまるごと初期化し直す関数
    setValue, // 特定の項目だけ値を書き換える関数
    formState: { errors, isDirty } // バリデーションエラーと、編集済みかどうかのフラグ
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues
  })

  // 親から渡される解析結果(defaultValues)が変わるたびに、フォームの内容を作り直す
  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const result = analysis.result

  // 締切候補ボタンが押された時、日付・時刻の2つの欄を候補の値で上書きする
  const handleSelectDeadlineCandidate = (isoDeadline: string): void => {
    const { date, time } = splitDeadline(isoDeadline)
    setValue('deadlineDate', date, { shouldDirty: true })
    setValue('deadlineTime', time, { shouldDirty: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {/* 元になったスクリーンショット画像のプレビュー */}
          <ImagePreview src={analysis.sourceImageUrl} />
          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">総合精度</span>
              <ConfidenceIndicator level={result.overallConfidence} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* AIが自信を持てなかった項目の警告(無ければ何も表示されない) */}
          {result && (
            <AmbiguityNotice
              ambiguousFields={result.ambiguousFields}
              deadlineCandidates={result.deadlineCandidates}
              onSelectDeadlineCandidate={handleSelectDeadlineCandidate}
            />
          )}
          {/* 重複しそうな既存課題の警告(無ければ何も表示されない) */}
          {result && result.duplicateCandidates.length > 0 && (
            <DuplicateWarning candidates={result.duplicateCandidates} />
          )}

          <div>
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-base">
              課題名
              {result && <ConfidenceIndicator level={result.fieldConfidence.title} />}
            </label>
            <input
              {...register('title')}
              className={inputClass}
              placeholder="例: 第5回レポート"
            />
            {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-base">
              科目名
              {result && <ConfidenceIndicator level={result.fieldConfidence.subject} />}
            </label>
            <input {...register('subject')} className={inputClass} />
            {errors.subject && <p className="mt-1 text-xs text-danger">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-base">
                提出期限（日付）
                {result && <ConfidenceIndicator level={result.fieldConfidence.deadline} />}
              </label>
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
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-base">
              提出方法
              {result && <ConfidenceIndicator level={result.fieldConfidence.submissionMethod} />}
            </label>
            <input {...register('submissionMethod')} className={inputClass} />
            {errors.submissionMethod && (
              <p className="mt-1 text-xs text-danger">{errors.submissionMethod.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-base">
              説明
              {result && <ConfidenceIndicator level={result.fieldConfidence.description} />}
            </label>
            <textarea {...register('description')} rows={4} className={inputClass} />
            {errors.description && (
              <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-secondary/30 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2 text-sm text-muted transition hover:bg-background"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onRetryAnalysis}
          disabled={isRetrying}
          className="rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition hover:bg-primary/5 disabled:opacity-50"
        >
          {isRetrying ? '再解析中…' : 'もう一度解析'}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {/* フォームが編集されているかどうかでボタンの文言を変える */}
          {isSubmitting ? '登録中…' : isDirty ? '修正して登録' : '登録する'}
        </button>
      </div>
    </form>
  )
}
