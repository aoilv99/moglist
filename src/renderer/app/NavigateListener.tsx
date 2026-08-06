/**
 * このファイルは何をするファイルか:
 * メインプロセスから送られてくる「このルートへ移動して」という指示を受け取り、
 * React Routerの画面遷移(navigate)に変換するための、画面には何も表示しないコンポーネントです。
 * 例えば、マスコットのメニューで「タスク確認」を押すと、メインプロセス経由で
 * ここが呼ばれ、`/tasks` へ自動的に画面遷移します。
 *
 * Bridges IPC route-navigation requests (e.g. from the mascot window's "タスク確認") into the router.
 * (日本語訳: IPC経由の画面遷移リクエスト(例: マスコットウィンドウの「タスク確認」)を
 *  React Routerへ橋渡しする)
 *
 * このファイルの中でやっていること:
 * - コンポーネントがマウントされたら、`window.mogulis.onNavigate` で通知を購読する
 * - 通知が来たら `navigate(route)` を呼び、実際に画面を切り替える
 * - コンポーネントが破棄される時は購読を解除する(メモリリーク防止)
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function NavigateListener(): null {
  const navigate = useNavigate()

  useEffect(() => {
    // メインプロセスからの「このルートへ移動して」通知を購読する
    const unsubscribe = window.mogulis.onNavigate((route) => {
      navigate(route)
    })
    // クリーンアップ時(アンマウント時)に購読を解除する
    return unsubscribe
  }, [navigate])

  // このコンポーネントは画面に何も表示しない(ロジックだけを持つ)
  return null
}
