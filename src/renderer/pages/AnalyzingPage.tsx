import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, type AssignmentAnalysis } from '@shared/types/api'
import { ErrorState } from '@renderer/components/feedback/ErrorState'
import { LoadingState } from '@renderer/components/feedback/LoadingState'
import { useAnalyzeImage } from '@renderer/hooks/useAnalysis'
import { useAnalysisStore } from '@renderer/stores/analysisStore'
import { usePendingImageStore } from '@renderer/stores/pendingImageStore'

export function AnalyzingPage(): JSX.Element {
  const navigate = useNavigate()
  const pendingImage = usePendingImageStore((state) => state.pendingImage)
  const setCurrentAnalysis = useAnalysisStore((state) => state.setCurrentAnalysis)
  const { mutateAsync, error, reset } = useAnalyzeImage()
  const [failedAnalysis, setFailedAnalysis] = useState<AssignmentAnalysis | null>(null)
  const startedRef = useRef(false)

  const runAnalysis = (): void => {
    if (!pendingImage) return
    setFailedAnalysis(null)
    reset()
    void mutateAsync(pendingImage.file).then(
      (analysis) => {
        setCurrentAnalysis(analysis)
        if (analysis.status === 'failed') {
          setFailedAnalysis(analysis)
          return
        }
        navigate(`/review/${analysis.id}`, { replace: true })
      },
      () => {
        // surfaced via `error` below
      }
    )
  }

  useEffect(() => {
    if (!pendingImage || startedRef.current) return
    startedRef.current = true
    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImage])

  if (!pendingImage) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <ErrorState
          error={new Error('画像を読み込めませんでした。もう一度スクショまたはドラッグ＆ドロップしてください。')}
          onCancel={() => navigate('/')}
          cancelLabel="ダッシュボードへ戻る"
        />
      </div>
    )
  }

  if (failedAnalysis) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <ErrorState
          error={failedAnalysis.error ? new ApiError(failedAnalysis.error) : undefined}
          onRetry={() => {
            setFailedAnalysis(null)
            runAnalysis()
          }}
          onCancel={() => navigate('/')}
          cancelLabel="キャンセル"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto mt-16 max-w-md">
        <ErrorState
          error={error}
          onRetry={() => runAnalysis()}
          onCancel={() => navigate('/')}
          cancelLabel="キャンセル"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <img
        src={pendingImage.previewUrl}
        alt="解析中の画像"
        className="max-h-48 rounded-2xl border border-secondary/40 object-contain shadow"
      />
      <LoadingState label="もぐもぐ解析中…" />
    </div>
  )
}
