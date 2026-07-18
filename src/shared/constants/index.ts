/**
 * このファイルは何をするファイルか:
 * アプリ全体(メインプロセス・レンダラーの両方)で使い回す「定数」をまとめたファイルです。
 * マジックナンバー(意味のわからない数値)をあちこちに書かず、ここに集約しています。
 *
 * このファイルの中でやっていること:
 * - 対応している画像形式(MIMEタイプ・拡張子)の一覧
 * - 画像の最大サイズ(10MB)
 * - 締切時刻が未検出の場合に使うデフォルト時刻(23:59)
 * - マスコットウィンドウ・マスコットキャラクター自体のサイズ
 */

// アップロードを許可する画像のMIMEタイプ一覧(バリデーションで使用)
export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp'
] as const

// アップロードを許可する画像の拡張子一覧
export const ACCEPTED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'] as const

// 画像ファイルの最大サイズ(10メガバイト)
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// 締切の「時刻」がOCRで検出できなかった時に使うデフォルト値
export const DEFAULT_DEADLINE_TIME = '23:59'

/**
 * The mascot character itself renders at 180x180 (see MASCOT_CHARACTER_SIZE
 * below), anchored to the bottom-right of this window. The window is taller
 * than the character so the click-menu popup and speech bubble — which
 * render above the character — have room; without it they'd be clipped by
 * the window's own top edge (Electron windows don't grow to fit overflow).
 * (日本語訳: マスコットキャラクター自体は180x180で表示され(下のMASCOT_CHARACTER_SIZE参照)、
 *  このウィンドウの右下に固定表示される。ウィンドウをキャラクターより高くしているのは、
 *  クリックメニューや吹き出しがキャラクターの「上」に表示されるための余白を確保するため。
 *  余白が無いと、Electronのウィンドウは中身がはみ出しても自動で大きくならないため、
 *  ウィンドウの上端で見切れてしまう)
 */
export const MASCOT_WINDOW_SIZE = { width: 200, height: 320 } as const

// マスコットキャラクター本体の表示サイズ
export const MASCOT_CHARACTER_SIZE = { width: 180, height: 180 } as const
