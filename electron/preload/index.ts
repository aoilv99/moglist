/**
 * このファイルは何をするファイルか:
 * Electronの「preloadスクリプト」です。メインプロセス(Node.js側)と
 * レンダラープロセス(React/ブラウザ側)の橋渡し役を担います。
 * `contextIsolation: true` の設定によりレンダラーはNode.jsの機能を直接使えないため、
 * ここで安全な関数だけを `window.mogulis` として公開し、React側から
 * `window.mogulis.openMainWindow()` のように呼び出せるようにします。
 *
 * このファイルの中でやっていること:
 * - `ipc.ts` で登録された各IPCチャンネルを、使いやすい関数の形に包んで公開する
 * - メインプロセスからの一方的な通知(ナビゲーション指示・画像受け渡し)を
 *   購読(subscribe)できる `onNavigate` / `onPendingImage` を用意する
 * - 範囲選択オーバーレイ専用の `window.mogulisOverlay` も同様に公開する
 */

import { contextBridge, ipcRenderer } from 'electron'
import type {
  MoguLisDesktopAPI,
  OverlayBridgeAPI,
  OverlaySelectionRect,
  PendingImagePayload
} from '@shared/types/electron'

// メインウィンドウ・マスコットウィンドウの両方から使われる、通常の機能一式
const api: MoguLisDesktopAPI = {
  // メインウィンドウを(今のルートのまま)開く
  openMainWindow: () => ipcRenderer.invoke('mogulis:open-main-window'),
  // メインウィンドウを開いて、指定したルート("/tasks"等)へ移動させる
  openMainWindowAtRoute: (route) =>
    ipcRenderer.invoke('mogulis:open-main-window-at-route', route),
  // 既にファイル化されたスクリーンショット画像をメインウィンドウへ渡す
  openMainWindowWithCapturedImage: (input) =>
    ipcRenderer.invoke('mogulis:open-main-window-with-captured-image', input),
  // ドラッグ&ドロップされた画像データ(バイト列)をメインウィンドウへ渡す
  openMainWindowWithImageData: (input) =>
    ipcRenderer.invoke('mogulis:open-main-window-with-image-data', input),
  // メインプロセスから「このルートへ移動して」という指示を受け取るための購読関数。
  // 戻り値の関数を呼ぶと購読を解除できる(Reactのクリーンアップ処理で使う)
  onNavigate: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, route: string): void => callback(route)
    ipcRenderer.on('mogulis:navigate', listener)
    return () => ipcRenderer.removeListener('mogulis:navigate', listener)
  },
  // メインプロセスから「この画像を解析して」という通知を受け取るための購読関数
  onPendingImage: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: PendingImagePayload): void =>
      callback(payload)
    ipcRenderer.on('mogulis:pending-image', listener)
    return () => ipcRenderer.removeListener('mogulis:pending-image', listener)
  },
  // 指定したパスのファイルをバイト列として読み込む(fetch(file://...)が使えない対策)
  readFile: (filePath) => ipcRenderer.invoke('mogulis:read-file', filePath),
  hideMascotWindow: () => ipcRenderer.invoke('mogulis:hide-mascot-window'),
  showMascotWindow: () => ipcRenderer.invoke('mogulis:show-mascot-window'),
  getMascotPosition: () => ipcRenderer.invoke('mogulis:get-mascot-position'),
  moveMascotWindow: (position) => ipcRenderer.invoke('mogulis:move-mascot-window', position),
  showNotification: (input) => ipcRenderer.invoke('mogulis:show-notification', input),
  getAppVersion: () => ipcRenderer.invoke('mogulis:get-app-version'),
  // 画面の範囲選択スクリーンショットを実行する
  captureScreenRegion: () => ipcRenderer.invoke('mogulis:capture-screen-region')
}

// 範囲選択オーバーレイウィンドウ専用の、小さな機能セット
const overlayApi: OverlayBridgeAPI = {
  // ユーザーが選んだ範囲(矩形)をメインプロセスへ送る
  confirmRegion: (rect: OverlaySelectionRect) => ipcRenderer.send('overlay:region-confirmed', rect),
  // 範囲選択をキャンセルしたことをメインプロセスへ送る
  cancelRegion: () => ipcRenderer.send('overlay:region-cancelled')
}

// contextBridgeを使って、上で作った関数群を安全にレンダラーのwindowオブジェクトへ公開する。
// これにより、React側のコードは `window.mogulis.xxx()` のように呼び出せる。
contextBridge.exposeInMainWorld('mogulis', api)
contextBridge.exposeInMainWorld('mogulisOverlay', overlayApi)
