/**
 * このファイルは何をするファイルか:
 * 画面右下に短時間だけ表示される「トースト通知」の仕組みをまとめたファイルです。
 * Reactの Context機能を使い、アプリのどこからでも `useToast().showToast(...)` を
 * 呼び出すだけで通知を出せるようにしています。
 *
 * このファイルの中でやっていること:
 * - `ToastProvider`: アプリ全体をラップし、通知の状態(表示中のトースト一覧)を管理する
 * - `showToast(message, variant)`: 新しいトーストを追加し、4秒後に自動で消す
 * - 種類(success/error/info)ごとに、アイコンと色を出し分ける
 * - `useToast()`: 他のコンポーネントから `showToast` を呼び出すためのフック。
 *   `ToastProvider` の外側で使うとエラーを投げるようにして、誤用に気づけるようにしている
 */

import { CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

// トーストの種類(成功/エラー/お知らせ)
type ToastVariant = 'success' | 'error' | 'info'

// 表示中のトースト1件分のデータ
interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

// Contextを通じて配布する値の型(トーストを表示する関数だけを提供する)
interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// トーストごとに一意なIDを振るための連番カウンター(モジュールスコープで共有)
let idCounter = 0

// 種類ごとのアイコン対応表
const VARIANT_ICON: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
}

// 種類ごとの枠線・背景・文字色の対応表
const VARIANT_CLASS: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary/10 text-primary'
}

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  // 現在表示中のトースト一覧
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // 新しいトーストを追加し、4秒後に自動で一覧から取り除く
  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 画面右下に固定表示するトースト一覧。
          外側はpointer-events-noneでクリックを透過し、トースト自体だけ
          pointer-events-autoでクリック可能に戻している(誤操作防止) */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant]
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-md ${VARIANT_CLASS[toast.variant]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/** 他のコンポーネントからトーストを表示するためのフック */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  // ToastProviderの外側で使われた場合は、原因に気づきやすいようエラーを投げる
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
