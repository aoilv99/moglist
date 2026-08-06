/**
 * このファイルは何をするファイルか:
 * Electronのpreload(electron/preload/index.ts)が公開するAPIの「型定義」をまとめたファイルです。
 * ここで定義した型を、main(処理の実装)・preload(公開)・renderer(利用)の
 * 3箇所すべてでimportして使うことで、関数名や引数のズレを防いでいます。
 *
 * Type-safe contract for the API exposed from the Electron preload script
 * to the renderer via `contextBridge`. Keep main/preload/renderer in sync
 * with this single definition.
 * (日本語訳: preloadがcontextBridge経由でrendererに公開するAPIの型安全な契約。
 *  main/preload/rendererの3つをこの1つの定義に合わせておくこと)
 *
 * このファイルの中でやっていること:
 * - `MoguLisDesktopAPI`: window.mogulis として公開される関数一覧の型
 * - `OverlayBridgeAPI`: 範囲選択オーバーレイ専用のwindow.mogulisOverlayの型
 * - `declare global` で、TypeScript上で `window.mogulis` にアクセスできるようにする
 */

import type { GeminiAnalyzeImageResponse, GeminiKeyStatus, GeminiKeyTestResult } from './gemini'

// スクリーンショット撮影結果(保存先ファイルパスとURL)の型
export interface ScreenCaptureResult {
  /** file:// URL of the captured (and cropped) PNG image */
  fileUrl: string
  /** Absolute filesystem path of the captured PNG image */
  filePath: string
}

/**
 * A screenshot or dropped image handed off from the mascot window to the
 * main window. The main window reads `filePath` back via `readFile` (not
 * `fetch(fileUrl)` — Chromium blocks file:// fetches from an http://
 * origin, which is what the renderer runs under in dev) into a `File` and
 * runs the analysis flow — this keeps all TanStack Query / routing state
 * in a single renderer.
 * (日本語訳: マスコットウィンドウからメインウィンドウへ引き渡される、
 *  スクリーンショットまたはドロップされた画像の情報。メインウィンドウは
 *  `fetch(fileUrl)`ではなく`readFile`(IPC経由)でfilePathの中身を読み込んで
 *  Fileオブジェクトを作る。これはChromiumがhttp://で動くdevサーバー上の
 *  ページからfile://を直接fetchできない制約があるため。こうすることで
 *  TanStack QueryやルーティングのすべてのState管理をメインウィンドウ1つに
 *  まとめられる)
 */
export interface PendingImagePayload {
  fileUrl: string
  filePath: string
  fileName: string
  mimeType: string
}

// window.mogulis として公開される関数一覧の型定義
export interface MoguLisDesktopAPI {
  /** Shows the main window, keeping whatever route it was last on. */
  // (メインウィンドウを、直前のルートのまま表示する)
  openMainWindow(): Promise<void>
  /** Shows the main window and navigates it to the given route (e.g. "/tasks"). */
  // (メインウィンドウを表示し、指定したルートへ移動させる)
  openMainWindowAtRoute(route: string): Promise<void>
  /** Shows the main window and hands off an already-captured image (see captureScreenRegion). */
  // (メインウィンドウを表示し、既に撮影済みのスクリーンショット画像を渡す)
  openMainWindowWithCapturedImage(input: { filePath: string; fileUrl: string }): Promise<void>
  /** Shows the main window and hands off raw image bytes (e.g. from a drag & drop). */
  // (メインウィンドウを表示し、ドラッグ&ドロップ等で得た画像の生バイト列を渡す)
  openMainWindowWithImageData(input: { name: string; type: string; data: ArrayBuffer }): Promise<void>
  /** Subscribes to route-navigation requests sent to the main window. Returns an unsubscribe fn. */
  // (メインウィンドウ宛の画面遷移リクエストを購読する。戻り値の関数で購読解除できる)
  onNavigate(callback: (route: string) => void): () => void
  /** Subscribes to pending-image handoffs sent to the main window. Returns an unsubscribe fn. */
  // (メインウィンドウ宛の「この画像を解析して」通知を購読する。戻り値の関数で購読解除できる)
  onPendingImage(callback: (payload: PendingImagePayload) => void): () => void
  /** Reads a local file's raw bytes — used to load a PendingImagePayload's filePath into a File. */
  // (ローカルファイルの中身をバイト列として読み込む。filePathからFileを作る時に使う)
  readFile(filePath: string): Promise<ArrayBuffer>
  hideMascotWindow(): Promise<void>
  showMascotWindow(): Promise<void>
  getMascotPosition(): Promise<{ x: number; y: number }>
  moveMascotWindow(position: { x: number; y: number }): Promise<void>
  showNotification(input: { title: string; body: string }): Promise<void>
  getAppVersion(): Promise<string>
  /**
   * Opens a full-screen overlay for region selection, captures the
   * selected region, and returns the resulting image. Resolves to
   * `null` if the user cancels the selection.
   * (日本語訳: 全画面の範囲選択オーバーレイを開き、選ばれた範囲を撮影して
   *  画像情報を返す。キャンセルされた場合はnullを返す)
   */
  captureScreenRegion(): Promise<ScreenCaptureResult | null>
  /** Whether a Gemini API key is currently saved (does not return the key itself). */
  // (Gemini APIキーが保存済みかどうかを返す。キーの値そのものは返さない)
  getGeminiKeyStatus(): Promise<GeminiKeyStatus>
  /** Encrypts and saves the given Gemini API key via safeStorage. */
  // (渡されたGemini APIキーをsafeStorageで暗号化して保存する)
  saveGeminiApiKey(key: string): Promise<void>
  /** Deletes the saved Gemini API key, if any. */
  // (保存済みのGemini APIキーを削除する)
  clearGeminiApiKey(): Promise<void>
  /** Sends a minimal request to Gemini to verify the given key works. */
  // (渡されたキーが有効かどうか、Gemini APIへ小さなリクエストを送って確認する)
  testGeminiApiKey(key: string): Promise<GeminiKeyTestResult>
  /** Sends image bytes to Gemini and returns the assignment analysis result. */
  // (画像の生バイト列をGemini APIへ送り、課題の解析結果を返す)
  analyzeImageWithGemini(input: { data: ArrayBuffer; mimeType: string }): Promise<GeminiAnalyzeImageResponse>
}

// 範囲選択で選ばれた矩形領域(左上座標+幅+高さ)の型
export interface OverlaySelectionRect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Exposed only inside the region-selection overlay window (`overlay.html`).
 * (日本語訳: 範囲選択オーバーレイウィンドウ(overlay.html)の中だけで使われる、
 *  window.mogulisOverlay の型定義)
 */
export interface OverlayBridgeAPI {
  confirmRegion(rect: OverlaySelectionRect): void
  cancelRegion(): void
}

// TypeScript上で `window.mogulis` / `window.mogulisOverlay` に型が付くようにする宣言
declare global {
  interface Window {
    mogulis: MoguLisDesktopAPI
    mogulisOverlay: OverlayBridgeAPI
  }
}
