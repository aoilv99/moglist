/**
 * このファイルは何をするファイルか:
 * OSのタスクトレイ(Windowsなら画面右下の通知領域)にアプリのアイコンを表示し、
 * そこから「管理画面を開く」「終了」ができるようにするファイルです。
 *
 * このファイルの中でやっていること:
 * - トレイアイコン用の画像を読み込む(もぐたの画像を32x32に縮小して使用)
 * - トレイアイコンを右クリックした時のメニュー(管理画面を開く/終了)を作る
 * - トレイアイコンを左クリックした時にメインウィンドウを開く
 */

import { Menu, Tray, app, nativeImage } from 'electron'
import path from 'node:path'
import { createMainWindow, setQuitting } from './windows'

// トレイは1つだけ作れば十分なので、モジュール外側の変数に保持しておく
let tray: Tray | null = null

/**
 * `resources/` sits outside `src/renderer`, so Vite never hashes/moves this file —
 * the same relative path resolves whether running via `electron-vite dev` or a
 * built app launched from the project root (packaging via electron-builder,
 * with `extraResources`, is not yet configured — see README "現在未実装の機能").
 * (日本語訳: `resources/`フォルダは`src/renderer`の外にあるため、Viteによって
 *  ファイル名がハッシュ化されたり移動されたりしない。そのため、開発時(electron-vite dev)
 *  でもビルド後でも同じ相対パスでアイコン画像を見つけられる。
 *  なお、electron-builderによる配布用パッケージング時のextraResources設定はまだ未実装)
 */
function trayIconPath(): string {
  return path.join(app.getAppPath(), 'resources/moguta_normal.png')
}

/** トレイアイコンを作成する(既に作成済みなら使い回す) */
export function createTray(): Tray {
  if (tray) return tray

  // もぐたの画像を読み込み、トレイアイコンに適した32x32サイズに縮小する
  const icon = nativeImage.createFromPath(trayIconPath()).resize({ width: 32, height: 32 })

  // 万が一画像の読み込みに失敗した場合(isEmpty)は、空のアイコンで代用してクラッシュを防ぐ
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)
  tray.setToolTip('MoguLis - 課題管理')

  // 右クリックで表示されるコンテキストメニューを作成する
  const menu = Menu.buildFromTemplate([
    {
      label: '管理画面を開く',
      click: () => createMainWindow()
    },
    { type: 'separator' },
    {
      label: '終了',
      click: () => {
        // 「終了中」フラグを立ててからquit()することで、
        // windows.ts側のclose処理が「隠すだけ」ではなく「本当に閉じる」ようになる
        setQuitting(true)
        app.quit()
      }
    }
  ])

  tray.setContextMenu(menu)
  // トレイアイコンを左クリックした時にもメインウィンドウを開けるようにする
  tray.on('click', () => createMainWindow())

  return tray
}
