/**
 * このファイルは何をするファイルか:
 * メインウィンドウの「共通レイアウト(骨組み)」を定義するコンポーネントです。
 * サイドバー・トップバー・本文エリアという3つの領域を組み合わせています。
 *
 * このファイルの中でやっていること:
 * - 画面全体を「左にサイドバー、右上にトップバー、右下に本文」という配置にする
 * - `children`(各ページの中身)を本文エリアに差し込む
 */

import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-base">
      {/* 左側の固定サイドバー(ダッシュボード/課題一覧への導線) */}
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 右上のトップバー(API接続状態などを表示) */}
        <TopBar />
        {/* 各画面(ダッシュボード・課題一覧等)の中身が表示される本文エリア */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
