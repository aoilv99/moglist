/**
 * このファイルは何をするファイルか:
 * スクリーンショットの範囲選択オーバーレイ(overlay.html)のReactアプリを起動する入り口ファイルです。
 *
 * このファイルの中でやっていること:
 * - `overlay.html` 内の `#root` 要素に対して `<OverlaySelector />` を描画する
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { OverlaySelector } from './OverlaySelector'
import '../styles/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <OverlaySelector />
  </React.StrictMode>
)
