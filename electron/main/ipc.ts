/**
 * このファイルは何をするファイルか:
 * レンダラー(画面側のReactコード)から呼び出される「IPC(プロセス間通信)」の
 * 受け口(ハンドラ)をまとめて登録するファイルです。
 * 「ウィンドウを開く」「画像をメインウィンドウへ渡す」「スクリーンショットを撮る」など、
 * レンダラーだけではできない(Node.js/OSの機能が必要な)処理をここで実行します。
 *
 * このファイルの中でやっていること:
 * - `registerIpcHandlers()` で、preload経由(window.mogulis.xxx)から呼べる各種処理を登録する
 * - マスコットウィンドウやメインウィンドウの表示・移動・位置取得
 * - デスクトップ通知の表示
 * - ドラッグ&ドロップやスクリーンショットで得た画像ファイルを、一時ファイルとして保存し
 *   メインウィンドウへ「これを解析してね」と知らせる(pending-image)
 * - `captureScreenRegion()` で、画面全体をキャプチャしてから、
 *   オーバーレイウィンドウでユーザーに範囲選択させ、選んだ範囲だけを切り出して保存する
 * - レンダラーがfile://のURLを直接fetchできない制約があるため、
 *   ファイルの中身をIPC経由で読み出す `mogulis:read-file` を提供する
 */

import { app, desktopCapturer, ipcMain, Notification, screen } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { PendingImagePayload, ScreenCaptureResult } from '@shared/types/electron'
import { analyzeImageWithGemini, testApiKey } from './geminiClient'
import { clearApiKey, getApiKey, hasApiKey, saveApiKey } from './geminiKeyStore'
import {
  createMainWindow,
  createMascotWindow,
  createOverlayWindow,
  getMascotWindow
} from './windows'

/**
 * Sends an IPC message to the main window, waiting for it to finish loading if needed.
 * (日本語訳: メインウィンドウへIPCメッセージを送る。まだ読み込み中なら、
 *  読み込みが終わってから送るように待機する)
 * メインウィンドウはまだ開かれていない場合もあるため、
 * `createMainWindow()`で(必要なら新規作成しつつ)ウィンドウを取得してから送信する。
 */
function sendToMainWindowWhenReady(channel: string, payload: unknown): void {
  const win = createMainWindow()
  const send = (): void => win.webContents.send(channel, payload)
  if (win.webContents.isLoading()) {
    // ページ読み込み中に送っても届かないため、読み込み完了イベントを待ってから送る
    win.webContents.once('did-finish-load', send)
  } else {
    send()
  }
}

/** Windowsのパス(バックスラッシュ区切り)を file:// URL 形式に変換する */
function toFileUrl(filePath: string): string {
  return `file://${filePath.replace(/\\/g, '/')}`
}

/** メインウィンドウを開いて、指定したルートへ移動させる(トレイメニューからも呼べるよう独立させている) */
export function openMainWindowAtRoute(route: string): void {
  sendToMainWindowWhenReady('mogulis:navigate', route)
}

/** アプリ起動時に一度だけ呼び出し、preloadから使えるすべてのIPCハンドラを登録する */
export function registerIpcHandlers(): void {
  // メインウィンドウを開く(既存のルートのまま表示するだけ)
  ipcMain.handle('mogulis:open-main-window', async () => {
    createMainWindow()
  })

  // メインウィンドウを開いて、指定したルート(例: "/tasks")へ移動させる
  ipcMain.handle('mogulis:open-main-window-at-route', async (_event, route: string) => {
    openMainWindowAtRoute(route)
  })

  // 既にファイルとして保存済みのスクリーンショット画像を、メインウィンドウへ引き渡す
  ipcMain.handle(
    'mogulis:open-main-window-with-captured-image',
    async (_event, input: { filePath: string; fileUrl: string }) => {
      const payload: PendingImagePayload = {
        fileUrl: input.fileUrl,
        filePath: input.filePath,
        fileName: path.basename(input.filePath),
        mimeType: 'image/png'
      }
      sendToMainWindowWhenReady('mogulis:pending-image', payload)
    }
  )

  // ドラッグ&ドロップされた画像データ(バイト列)を一時ファイルとして保存し、
  // そのファイルをメインウィンドウへ引き渡す
  ipcMain.handle(
    'mogulis:open-main-window-with-image-data',
    async (_event, input: { name: string; type: string; data: ArrayBuffer }) => {
      // MIMEタイプから拡張子を決める(png/webp以外はjpgとして扱う)
      const extension = input.type === 'image/webp' ? 'webp' : input.type === 'image/png' ? 'png' : 'jpg'
      const filePath = path.join(app.getPath('temp'), `mogulis-drop-${Date.now()}.${extension}`)
      await fs.writeFile(filePath, Buffer.from(input.data))
      const payload: PendingImagePayload = {
        fileUrl: toFileUrl(filePath),
        filePath,
        fileName: input.name,
        mimeType: input.type
      }
      sendToMainWindowWhenReady('mogulis:pending-image', payload)
    }
  )

  // マスコットウィンドウを隠す
  ipcMain.handle('mogulis:hide-mascot-window', async () => {
    getMascotWindow()?.hide()
  })

  // マスコットウィンドウを表示する(無ければ新しく作る)
  ipcMain.handle('mogulis:show-mascot-window', async () => {
    const win = getMascotWindow() ?? createMascotWindow()
    win.show()
  })

  // マスコットウィンドウをドラッグで移動させた時、新しい座標を設定する
  ipcMain.handle(
    'mogulis:move-mascot-window',
    async (_event, position: { x: number; y: number }) => {
      getMascotWindow()?.setPosition(Math.round(position.x), Math.round(position.y))
    }
  )

  // マスコットウィンドウの現在位置を返す(ドラッグ開始時の基準座標として使う)
  ipcMain.handle('mogulis:get-mascot-position', async () => {
    const [x, y] = getMascotWindow()?.getPosition() ?? [0, 0]
    return { x, y }
  })

  // OSのデスクトップ通知を表示する
  ipcMain.handle('mogulis:show-notification', async (_event, input: { title: string; body: string }) => {
    new Notification({ title: input.title, body: input.body }).show()
  })

  // package.jsonのバージョン番号を返す
  ipcMain.handle('mogulis:get-app-version', async () => app.getVersion())

  // 画面の範囲選択スクリーンショットを実行する(詳細は下のcaptureScreenRegion関数)
  ipcMain.handle('mogulis:capture-screen-region', async () => captureScreenRegion())

  // Renderer `fetch()` can't load file:// URLs from the http://localhost
  // origin the dev server runs under, so pending-image handoffs are read
  // back through IPC instead.
  // (日本語訳: 開発サーバー(http://localhost)で動くレンダラーからは
  //  fetch()でfile://のURLを読み込めないため、代わりにIPC経由でファイルの
  //  中身(バイナリ)を直接読み出せるようにする)
  ipcMain.handle('mogulis:read-file', async (_event, filePath: string) => {
    const buffer = await fs.readFile(filePath)
    // Node.jsのBufferをブラウザ側で扱えるArrayBufferへ変換して返す
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  })

  // Gemini APIキーが保存済みかどうかを返す(キーの値自体は返さない)
  ipcMain.handle('mogulis:gemini-get-key-status', async () => ({ configured: await hasApiKey() }))

  // Gemini APIキーを暗号化して保存する
  ipcMain.handle('mogulis:gemini-save-key', async (_event, key: string) => {
    await saveApiKey(key)
  })

  // 保存済みのGemini APIキーを削除する
  ipcMain.handle('mogulis:gemini-clear-key', async () => {
    await clearApiKey()
  })

  // 渡されたキーが有効かどうかをGemini APIへ小さなリクエストを送って確認する
  ipcMain.handle('mogulis:gemini-test-key', async (_event, key: string) => testApiKey(key))

  // 画像をGeminiへ送って解析し、AssignmentAnalysisResult相当の結果を返す
  ipcMain.handle(
    'mogulis:gemini-analyze-image',
    async (_event, input: { data: ArrayBuffer; mimeType: string }) => {
      const apiKey = await getApiKey()
      return analyzeImageWithGemini(apiKey, input)
    }
  )
}

/**
 * 画面の範囲選択スクリーンショットを行うメイン処理。
 * 大まかな流れ:
 *   1. 画面全体をキャプチャする(desktopCapturer)
 *   2. 範囲選択用の透明なオーバーレイウィンドウを開く
 *   3. ユーザーがドラッグで範囲を選ぶ(または選ばずキャンセルする)のを待つ
 *   4. 選ばれた範囲だけを切り出してPNGとして一時ファイルに保存する
 * キャンセルされた場合、または範囲が小さすぎる場合は null を返す。
 */
async function captureScreenRegion(): Promise<ScreenCaptureResult | null> {
  const primaryDisplay = screen.getPrimaryDisplay()
  // 高解像度ディスプレイ(Retina等)でもぼやけないよう、拡大率(scaleFactor)を考慮した
  // 実ピクセルサイズでキャプチャする
  const scaleFactor = primaryDisplay.scaleFactor
  const thumbnailSize = {
    width: Math.round(primaryDisplay.size.width * scaleFactor),
    height: Math.round(primaryDisplay.size.height * scaleFactor)
  }

  // OSから画面全体の静止画(ソース一覧)を取得する
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize })
  // メインディスプレイに対応するソースを探す(見つからなければ先頭を使う)
  const source = sources.find((s) => s.display_id === String(primaryDisplay.id)) ?? sources[0]
  if (!source) return null

  const fullImage = source.thumbnail
  // 範囲選択用の透明なオーバーレイウィンドウを表示する
  const overlayWindow = createOverlayWindow()

  // オーバーレイ側から「範囲を確定した(overlay:region-confirmed)」または
  // 「キャンセルした(overlay:region-cancelled)」の通知が来るのを待つ。
  // ウィンドウが閉じられた場合もキャンセル扱いにする。
  const region = await new Promise<{ x: number; y: number; width: number; height: number } | null>(
    (resolve) => {
      // 複数の完了経路(確定/キャンセル/ウィンドウクローズ)があるため、
      // 二重に処理されないよう「settled」フラグで一度だけ実行されるようにする
      let settled = false

      const finish = (value: { x: number; y: number; width: number; height: number } | null): void => {
        if (settled) return
        settled = true
        ipcMain.removeListener('overlay:region-confirmed', handleConfirm)
        ipcMain.removeListener('overlay:region-cancelled', handleCancel)
        resolve(value)
        if (!overlayWindow.isDestroyed()) overlayWindow.close()
      }

      const handleConfirm = (
        _event: Electron.IpcMainEvent,
        rect: { x: number; y: number; width: number; height: number }
      ): void => finish(rect)
      const handleCancel = (): void => finish(null)

      ipcMain.once('overlay:region-confirmed', handleConfirm)
      ipcMain.once('overlay:region-cancelled', handleCancel)
      overlayWindow.once('closed', () => finish(null))
    }
  )

  // キャンセルされた場合、または選択範囲が小さすぎる(誤クリックとみなせる)場合は失敗として扱う
  if (!region || region.width < 4 || region.height < 4) {
    return null
  }

  // 選択された範囲(CSSピクセル)を、実ピクセル(scaleFactor倍)に変換して画像を切り抜く
  const cropped = fullImage.crop({
    x: Math.round(region.x * scaleFactor),
    y: Math.round(region.y * scaleFactor),
    width: Math.round(region.width * scaleFactor),
    height: Math.round(region.height * scaleFactor)
  })

  // 切り抜いた画像をPNG形式のバイト列に変換し、一時フォルダにファイルとして保存する
  const buffer = cropped.toPNG()
  const filePath = path.join(app.getPath('temp'), `mogulis-capture-${Date.now()}.png`)
  await fs.writeFile(filePath, buffer)

  return { filePath, fileUrl: toFileUrl(filePath) }
}
