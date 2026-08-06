/**
 * このファイルは何をするファイルか:
 * TypeScriptに対して「Viteが用意する特殊な機能」の型を教えるための宣言ファイルです。
 * 画像ファイルのimport(例: `import icon from './icon.png'`)や、
 * `import.meta.env` で環境変数(.envファイルの中身)にアクセスする際の型が、
 * このファイルのおかげで正しく認識されます。処理そのものは行いません。
 */

/// <reference types="vite/client" />

// .envファイルで定義している環境変数の一覧と型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
