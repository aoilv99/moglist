/**
 * このファイルは何をするファイルか:
 * メインウィンドウ(課題一覧・ダッシュボードなどを表示するウィンドウ)の
 * Reactアプリ全体のルート(一番外側)のコンポーネントです。
 * ここで「どのURLパスにどの画面を表示するか」のルーティングを定義しています。
 *
 * このファイルの中でやっていること:
 * - QueryClientProvider: TanStack Query(サーバーデータ管理)をアプリ全体で使えるようにする
 * - ToastProvider: 画面右下に出す通知(トースト)をアプリ全体で使えるようにする
 * - HashRouter: URLの#以降でルーティングするReact Router(Electronのfile://環境でも安全に動く)
 * - NavigateListener / PendingImageListener: メインプロセスからの指示(画面遷移・画像受け渡し)
 *   を監視する、見た目を持たないコンポーネント
 * - Routes: 5つの画面(ダッシュボード/課題一覧/課題詳細/解析中/解析結果確認)へのルートを定義する
 */

import { QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@renderer/components/app/AppShell'
import { ToastProvider } from '@renderer/components/feedback/ToastProvider'
import { AnalysisReview } from '@renderer/pages/AnalysisReview'
import { AnalyzingPage } from '@renderer/pages/AnalyzingPage'
import { Dashboard } from '@renderer/pages/Dashboard'
import { SettingsPage } from '@renderer/pages/SettingsPage'
import { TaskDetail } from '@renderer/pages/TaskDetail'
import { TaskListPage } from '@renderer/pages/TaskListPage'
import { NavigateListener } from './NavigateListener'
import { PendingImageListener } from './PendingImageListener'
import { queryClient } from './queryClient'

export function App(): JSX.Element {
  return (
    // アプリ全体でTanStack Query(サーバーデータのキャッシュ)を使えるようにする
    <QueryClientProvider client={queryClient}>
      {/* アプリ全体でトースト通知(showToast)を使えるようにする */}
      <ToastProvider>
        {/* URLの#以降でルーティングする(Electronでもファイルパスの問題が起きにくい) */}
        <HashRouter>
          {/* メインプロセスからの「このルートへ移動して」通知を監視する */}
          <NavigateListener />
          {/* メインプロセスからの「この画像を解析して」通知を監視する */}
          <PendingImageListener />
          {/* サイドバー+トップバー+本文、という共通レイアウト */}
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskListPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetail />} />
              <Route path="/analyzing" element={<AnalyzingPage />} />
              <Route path="/review/:analysisId" element={<AnalysisReview />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
