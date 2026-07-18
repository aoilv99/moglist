/**
 * このファイルは何をするファイルか:
 * メインウィンドウの最初の画面「ダッシュボード」(ルート `/`)を表示するページコンポーネントです。
 * 今日/今週締切・期限切れ・最近登録した課題を、それぞれセクションごとに一覧表示します。
 *
 * このファイルの中でやっていること:
 * - `Section`: 見出し+中身、という小さな共通レイアウトを作るための内部コンポーネント
 * - `useTasks` を4パターンの条件(今日/今週/期限切れ/最近登録)で呼び出し、
 *   それぞれ別々のセクションとして表示する
 * - `useHealth` でAPI接続状態を取得し、上部にステータスバッジを表示する
 * - 「スクショして食べさせよう」という操作案内カードを上部に表示する
 * - 各セクションは、読み込み中/データあり/データなしの3状態を出し分ける
 */

import { Camera, Wifi, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@renderer/components/feedback/EmptyState'
import { LoadingState } from '@renderer/components/feedback/LoadingState'
import { TaskList } from '@renderer/components/task/TaskList'
import { useHealth } from '@renderer/hooks/useHealth'
import { useTasks } from '@renderer/hooks/useTasks'
import { USE_MOCK_API } from '@renderer/services/api/client'

/** 見出し付きのセクションを作る、ダッシュボード内だけで使う小さな共通コンポーネント */
function Section({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-muted">{title}</h2>
      {children}
    </section>
  )
}

export function Dashboard(): JSX.Element {
  // それぞれ異なる条件で課題一覧を取得する(4つの独立したクエリ)
  const todayQuery = useTasks({ filter: 'today', sort: 'deadlineAsc' })
  const thisWeekQuery = useTasks({ filter: 'thisWeek', sort: 'deadlineAsc' })
  const overdueQuery = useTasks({ filter: 'overdue', sort: 'deadlineAsc' })
  const recentQuery = useTasks({ sort: 'createdAtDesc', pageSize: 5 })
  const { data: health } = useHealth()
  const isHealthy = health?.status === 'ok'

  return (
    <div className="space-y-8">
      {/* 操作方法を案内するカード */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-text-base">
              課題画面をスクショして、もぐたに食べさせよう！
            </p>
            <p className="text-xs text-muted">
              デスクトップに常駐しているもぐたをクリックして「スクショ」、または画像をドラッグ＆ドロップしてください。
            </p>
          </div>
        </div>
      </div>

      {/* モックモード表示とAPI接続状態のバッジ */}
      <div className="flex flex-wrap gap-3 text-xs">
        {USE_MOCK_API && (
          <span className="rounded-full bg-warning/10 px-3 py-1 font-medium text-warning">
            モックモードで動作中
          </span>
        )}
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
            isHealthy ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
        >
          {isHealthy ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isHealthy ? 'APIに接続中' : 'API未接続'}
        </span>
      </div>

      {/* 各セクションは「読み込み中」「データあり」「データなし(空状態)」の3パターンを出し分ける */}
      <Section title="今日締切の課題">
        {todayQuery.isLoading ? (
          <LoadingState label="読み込み中…" />
        ) : todayQuery.data && todayQuery.data.tasks.length > 0 ? (
          <TaskList tasks={todayQuery.data.tasks} />
        ) : (
          <EmptyState title="今日締切の課題はありません" />
        )}
      </Section>

      <Section title="今週締切の課題">
        {thisWeekQuery.isLoading ? (
          <LoadingState label="読み込み中…" />
        ) : thisWeekQuery.data && thisWeekQuery.data.tasks.length > 0 ? (
          <TaskList tasks={thisWeekQuery.data.tasks} />
        ) : (
          <EmptyState title="今週締切の課題はありません" />
        )}
      </Section>

      <Section title="期限切れの課題">
        {overdueQuery.isLoading ? (
          <LoadingState label="読み込み中…" />
        ) : overdueQuery.data && overdueQuery.data.tasks.length > 0 ? (
          <TaskList tasks={overdueQuery.data.tasks} />
        ) : (
          <EmptyState title="期限切れの課題はありません" description="よくできました！" />
        )}
      </Section>

      <Section title="最近登録した課題">
        {recentQuery.isLoading ? (
          <LoadingState label="読み込み中…" />
        ) : recentQuery.data && recentQuery.data.tasks.length > 0 ? (
          <TaskList tasks={recentQuery.data.tasks} />
        ) : (
          <EmptyState
            title="まだ課題が登録されていません"
            description="スクショをもぐたに食べさせて最初の課題を登録しましょう。"
            action={
              <Link to="/tasks" className="text-sm font-medium text-primary underline">
                課題一覧を見る
              </Link>
            }
          />
        )}
      </Section>
    </div>
  )
}
