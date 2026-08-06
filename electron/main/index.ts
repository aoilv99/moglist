/**
 * このファイルは何をするファイルか:
 * Electronアプリの「メインプロセス」のエントリーポイント(起動時に最初に実行されるファイル)です。
 * アプリ全体のライフサイクル(起動・ウィンドウの出し入れ・終了)を管理します。
 *
 * このファイルの中でやっていること:
 * - アプリ起動時にIPC(レンダラーとメインプロセスの通信)ハンドラを登録する
 * - 常駐リス(マスコット)ウィンドウを作成する
 * - タスクトレイのアイコンを作成する
 * - macOSのDockアイコンクリックなどで「activate」イベントが来たときの挙動を定義する
 * - ウィンドウを全部閉じても即座にアプリを終了させず、トレイに常駐させ続ける
 */

import { app, BrowserWindow } from 'electron'
import { registerIpcHandlers } from './ipc'
import { createTray } from './tray'
import { createMascotWindow, getMainWindow, getMascotWindow, setQuitting } from './windows'

// Windowsの通知(トースト)にアプリ名を正しく表示させるためのID設定
app.setAppUserModelId('com.mogulis.app')

// Electronの初期化が完了したタイミングで実行される
app.whenReady().then(() => {
  // レンダラー(画面側)から呼び出せるIPC関数(openMainWindow等)を登録する
  registerIpcHandlers()
  // デスクトップ右下に表示する常駐リスのウィンドウを作成する
  createMascotWindow()
  // タスクトレイにアイコンとメニュー(管理画面を開く/終了)を作成する
  createTray()

  // macOSでDockアイコンをクリックした時などに発火するイベント
  app.on('activate', () => {
    // ウィンドウが1つも無い場合は、常駐リスのウィンドウを作り直す
    if (BrowserWindow.getAllWindows().length === 0) {
      createMascotWindow()
      return
    }
    // メインウィンドウが存在すればそれを表示し、無ければマスコットウィンドウを表示する
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.show()
    } else {
      getMascotWindow()?.show()
    }
  })
})

// MoguLis lives on in the tray after its windows are hidden — only the tray's
// "終了" menu item (which flips setQuitting(true)) should actually quit the app.
// (日本語訳: ウィンドウを閉じてもアプリは終了せずトレイに常駐し続ける。
//  実際に終了するのは、トレイメニューの「終了」がsetQuitting(true)を呼んだ時だけ)
app.on('window-all-closed', () => {
  // no-op: intentionally do not quit here
  // (ここでは何もしない。全ウィンドウが閉じても自動終了させないための空処理)
})

// アプリが本当に終了する直前に呼ばれる。「終了中フラグ」を立てることで、
// windows.ts側のclose処理が「ウィンドウを隠すだけ」ではなく「実際に閉じる」ように切り替わる
app.on('before-quit', () => {
  setQuitting(true)
})
