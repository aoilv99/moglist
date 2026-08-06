/**
 * このファイルは何をするファイルか:
 * メインウィンドウ(index.html)のReactアプリを実際に起動する、最初の入り口ファイルです。
 * index.htmlの `<div id="root">` に対して、Reactアプリ全体(App)を描画します。
 *
 * このファイルの中でやっていること:
 * - `index.html` 内の `#root` 要素を取得する
 * - Reactのルートを作り、`<App />` を描画する
 * - `React.StrictMode` で囲むことで、開発中に不具合になりやすい書き方を検出しやすくする
 * - 共通スタイル(Tailwind CSS)を読み込む
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import '../styles/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
