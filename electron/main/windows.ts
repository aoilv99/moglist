/**
 * このファイルは何をするファイルか:
 * アプリが使う3種類のウィンドウ(①課題一覧などを表示する「メインウィンドウ」、
 * ②デスクトップに常駐する「マスコット(もぐた)ウィンドウ」、
 * ③スクリーンショットの範囲選択に使う「オーバーレイウィンドウ」)を
 * 作成・管理する関数をまとめたファイルです。
 *
 * このファイルの中でやっていること:
 * - 各ウィンドウの生成(サイズ・位置・透過/枠なし等の見た目設定)
 * - 開発時(Vite開発サーバー)と本番ビルド時でウィンドウが読み込むURLを切り替える
 * - ウィンドウの「×」ボタンを押しても本当には閉じず、隠すだけにする(トレイ常駐のため)
 * - 現在生成済みのウィンドウを他のファイル(ipc.tsなど)から取得できるようにする
 */

import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { MASCOT_WINDOW_SIZE } from '@shared/constants'

// メインウィンドウとマスコットウィンドウは、アプリ全体で1つだけ存在させたいので
// モジュールの外側(グローバル)の変数として保持しておく
let mainWindow: BrowserWindow | null = null
let mascotWindow: BrowserWindow | null = null
// true になったら「×」ボタンやウィンドウ閉じる操作で本当にウィンドウを閉じてよい、という合図
let quitting = false

/** アプリを本当に終了させたい時に true にする(トレイの「終了」から呼ばれる) */
export function setQuitting(value: boolean): void {
  quitting = value
}

/** 現在開いているメインウィンドウを返す(無ければnull) */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

/** 現在開いているマスコットウィンドウを返す(無ければnull) */
export function getMascotWindow(): BrowserWindow | null {
  return mascotWindow
}

/** preloadスクリプト(ビルド後のファイル)の絶対パスを組み立てる */
function preloadPath(): string {
  return path.join(__dirname, '../preload/index.js')
}

/**
 * 画面(index/mascot/overlay)ごとに、読み込むURLを組み立てる。
 * 開発中はViteの開発サーバー(http://localhost:5173等)から読み込み、
 * 本番ビルド後はビルド済みのHTMLファイルをfile://で直接読み込む。
 */
function rendererUrl(page: 'index' | 'mascot' | 'overlay'): string {
  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
  if (devServerUrl) {
    return page === 'index' ? devServerUrl : `${devServerUrl}/${page}.html`
  }
  return `file://${path.join(__dirname, `../renderer/${page}.html`)}`
}

/** 課題一覧・ダッシュボードなどを表示する「メインウィンドウ」を作成(または表示)する */
export function createMainWindow(): BrowserWindow {
  // 既にウィンドウが存在する場合は、新しく作らずに表示・前面化するだけにする
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
    mainWindow.focus()
    return mainWindow
  }

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 760,
    minHeight: 560,
    show: false, // 読み込みが終わってから表示することでチラつきを防ぐ
    backgroundColor: '#FFF9F2', // 読み込み中に見える背景色(アプリのテーマ色)
    autoHideMenuBar: true, // メニューバー(ファイル/編集など)を自動で隠す
    webPreferences: {
      preload: preloadPath(),
      // セキュリティのため、レンダラー側からNode.js機能へ直接アクセスできないようにする
      nodeIntegration: false,
      // レンダラーとpreloadのJS実行環境を分離する(必須のセキュリティ設定)
      contextIsolation: true
    }
  })

  mainWindow.loadURL(rendererUrl('index'))

  // ページの初回描画準備ができたタイミングで画面を表示する
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Closing the window hides it instead of quitting — MoguLis stays resident via the tray.
  // (日本語訳: ウィンドウを閉じても終了はせず、隠すだけにする。MoguLisはトレイに常駐し続ける)
  mainWindow.on('close', (event) => {
    if (!quitting) {
      // デフォルトの「閉じる」動作をキャンセルして、代わりに非表示にする
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // 本当にウィンドウが破棄された時は、変数をリセットして次回また作り直せるようにする
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

/** デスクトップに常駐する「もぐた」のウィンドウを作成する */
export function createMascotWindow(): BrowserWindow {
  if (mascotWindow && !mascotWindow.isDestroyed()) {
    return mascotWindow
  }

  // メイン画面(プライマリディスプレイ)の作業領域(タスクバーを除いた範囲)を取得し、
  // その右下に少し余白(24px)を空けてウィンドウを配置する
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: sw, height: sh, x: ox, y: oy } = primaryDisplay.workArea
  const x = ox + sw - MASCOT_WINDOW_SIZE.width - 24
  const y = oy + sh - MASCOT_WINDOW_SIZE.height - 24

  mascotWindow = new BrowserWindow({
    width: MASCOT_WINDOW_SIZE.width,
    height: MASCOT_WINDOW_SIZE.height,
    x,
    y,
    frame: false, // タイトルバーや枠を非表示にする
    transparent: true, // 背景を透明にして、キャラクターだけが浮いて見えるようにする
    resizable: false, // ユーザーがサイズ変更できないようにする
    alwaysOnTop: true, // 他のウィンドウより常に手前に表示する
    skipTaskbar: true, // タスクバーにアイコンを表示しない(常駐アプリらしくするため)
    hasShadow: false, // ウィンドウの影を消す(キャラクターの見た目を邪魔しないため)
    webPreferences: {
      preload: preloadPath(),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 'screen-saver'レベルを指定することで、タスクバーや他アプリよりさらに手前に固定する
  mascotWindow.setAlwaysOnTop(true, 'screen-saver')
  mascotWindow.loadURL(rendererUrl('mascot'))

  mascotWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault()
      mascotWindow?.hide()
    }
  })

  mascotWindow.on('closed', () => {
    mascotWindow = null
  })

  return mascotWindow
}

/**
 * Full-screen transparent window used for screenshot region selection.
 * (日本語訳: スクリーンショットの範囲選択に使う、画面全体を覆う透明なウィンドウ)
 * 「スクショ」機能を押した時に一時的に作られ、範囲選択が終わったら閉じられる。
 */
export function createOverlayWindow(): BrowserWindow {
  // ディスプレイ全体(タスクバーも含む実際の画面サイズ)を取得する
  const primaryDisplay = screen.getPrimaryDisplay()
  const { x, y, width, height } = primaryDisplay.bounds

  const overlayWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      preload: preloadPath(),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  // マウスイベント(クリックやドラッグ)をこのウィンドウでちゃんと受け取れるようにする
  overlayWindow.setIgnoreMouseEvents(false)
  overlayWindow.loadURL(rendererUrl('overlay'))

  return overlayWindow
}
