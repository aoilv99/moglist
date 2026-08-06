/**
 * このファイルは何をするファイルか:
 * メインウィンドウ左側のサイドバー(ナビゲーションメニュー)を表示するコンポーネントです。
 *
 * このファイルの中でやっていること:
 * - 「ダッシュボード」「課題一覧」への遷移リンクを一覧表示する
 * - 現在表示中のページに対応するリンクをハイライトする(NavLinkのisActiveを利用)
 * - サイドバーの開閉(幅を広げる/狭める)をZustandストアで管理し、ボタンで切り替える
 * - 下部に「設定」への遷移リンクを表示する(Gemini APIキーの登録画面)
 */

import { LayoutDashboard, ListTodo, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useSidebarStore } from '@renderer/stores/sidebarStore'

// サイドバーに表示するナビゲーション項目の一覧
const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: '課題一覧', icon: ListTodo, end: false }
] as const

export function Sidebar(): JSX.Element {
  const { isOpen, toggle } = useSidebarStore()

  return (
    <aside
      className={`flex h-full flex-col border-r border-secondary/30 bg-surface transition-all ${isOpen ? 'w-56' : 'w-16'}`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* 開いている時だけアプリ名を表示する(閉じている時はアイコンのみ) */}
        {isOpen && <span className="text-lg font-bold text-primary">MoguLis</span>}
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-1.5 text-muted transition hover:bg-background"
          aria-label="サイドバー切り替え"
        >
          {isOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              // 現在のページに対応するリンクだけ、色を変えてハイライトする
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-background'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {isOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-secondary/30 px-2 py-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-background'
            }`
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          {isOpen && <span>設定</span>}
        </NavLink>
      </div>
    </aside>
  )
}
