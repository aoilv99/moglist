/**
 * このファイルは何をするファイルか:
 * TanStack Query(サーバーデータの取得・キャッシュを管理するライブラリ)の
 * 「QueryClient」インスタンスを1つだけ作成して、アプリ全体で共有するためのファイルです。
 *
 * このファイルの中でやっていること:
 * - QueryClientを作成し、デフォルトの挙動を設定する
 *   - retry: 1 → 通信が失敗したら1回だけ自動で再試行する
 *   - refetchOnWindowFocus: false → ウィンドウにフォーカスが戻った時の自動再取得を無効にする
 *     (常駐アプリでウィンドウの表示/非表示が頻繁なため、無駄な通信を防ぐ)
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
