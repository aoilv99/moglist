/**
 * このファイルは何をするファイルか:
 * 「解析中」画面(ルート `/analyzing`)を表示するページコンポーネントです。
 * マスコットから渡された画像を実際に解析APIへ送信し、結果に応じて
 * 解析結果確認画面へ自動的に移動する「つなぎ役」の画面です。
 *
 * このファイルの中でやっていること:
 * - `pendingImage`(ストアに保存された、これから解析する画像)を読み取る
 * - `runAnalysis`: 解析APIを呼び出し、結果によって次の挙動を分岐する
 *   - 解析自体が失敗した状態(status: 'failed')で返ってきた場合は、
 *     その場でエラー画面を表示する(OCR失敗などのケース)
 *   - 解析が成功していれば、結果をストアに保存して確認画面(/review/:id)へ移動する
 * - `mutate`ではなく`mutateAsync`を使っている理由: `mutate`のコールバックは
 *   タイミングによって呼ばれないことがあったため、Promiseを直接awaitできる
 *   `mutateAsync`に変更して確実性を高めている
 * - 画面がマウントされた時に自動で1回だけ解析を実行する(`startedRef`で二重実行を防止)
 * - 画像が届いていない/解析が失敗した/通信自体が失敗した、の3パターンでエラー表示を出す
 */

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
  // 「解析処理自体は成功したが、結果がfailedだった」ケースを保持する状態
  const [failedAnalysis, setFailedAnalysis] = useState<AssignmentAnalysis | null>(null)
  // 画面マウント時の自動実行を1回だけに制限するためのフラグ
  const startedRef = useRef(false)

  // 実際に解析APIを呼び出す処理。「もう一度解析」ボタンからも呼ばれる
  const runAnalysis = (): void => {
    if (!pendingImage) return
    setFailedAnalysis(null)
    reset()
    void mutateAsync(pendingImage.file).then(
      (analysis) => {
        setCurrentAnalysis(analysis)
        if (analysis.status === 'failed') {
          // 解析自体は完了したが、中身が「失敗」だった場合(OCR失敗等)
          setFailedAnalysis(analysis)
          return
        }
        // 成功したら、結果をストアに保存済みなので確認画面へ移動する
        navigate(`/review/${analysis.id}`, { replace: true })
      },
      () => {
        // surfaced via `error` below
        // (日本語訳: 通信自体のエラーは、下記の`error`(useAnalyzeImageの状態)経由で表示される)
      }
    )
  }

  // 画面が表示された時、pendingImageがあれば自動的に解析を開始する(初回のみ)
  useEffect(() => {
    if (!pendingImage || startedRef.current) return
    startedRef.current = true
    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImage])

  // ケース1: そもそも画像が読み込めていない(PendingImageListenerでの読み込み失敗)
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

  // ケース2: 解析処理自体は成功したが、結果の中身が「失敗」だった(OCR失敗等)
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

  // ケース3: 通信自体が失敗した(ネットワークエラー等)
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

  // 通常時: 解析中の画像プレビューとローディング表示を出す
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
