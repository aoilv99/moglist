/**
 * このファイルは何をするファイルか:
 * マスコット(もぐた)ウィンドウ(mascot.html)のReactアプリを起動する入り口ファイルです。
 * メインウィンドウ(app/main.tsx)とは別の、独立したReactアプリとして動きます。
 *
 * このファイルの中でやっていること:
 * - `mascot.html` 内の `#root` 要素に対して `<MascotApp />` を描画する
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { MascotApp } from './MascotApp'
import '../styles/index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MascotApp />
  </React.StrictMode>
)
