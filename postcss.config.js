/**
 * このファイルは何をするファイルか:
 * CSSを加工するツール「PostCSS」の設定ファイルです。
 * Tailwind CSSのクラス名を実際のCSSに変換したり、ブラウザごとの差異を
 * 吸収するためのベンダープレフィックス(-webkit-等)を自動で付け足したりします。
 *
 * このファイルの中でやっていること:
 * - `tailwindcss`: Tailwindのクラス名をCSSへ変換するプラグインを有効にする
 * - `autoprefixer`: 必要に応じてベンダープレフィックスを自動付与するプラグインを有効にする
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
