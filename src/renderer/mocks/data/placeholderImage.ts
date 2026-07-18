/**
 * このファイルは何をするファイルか:
 * モックモードで「本物の画像ファイルが無い代わりに表示する」プレースホルダー画像を
 * その場で生成する関数を定義するファイルです。実際の画像ファイルを用意しなくても、
 * SVGをその場で組み立てて画像として使えるようにしています。
 *
 * このファイルの中でやっていること:
 * - `buildPlaceholderScreenshotDataUrl`: 指定したラベル文字列を中央に表示する、
 *   シンプルな枠付きのSVG画像を作り、`data:` URL(画像データを直接埋め込んだURL)として返す
 */

/** Builds a lightweight inline placeholder image standing in for a real screenshot in mock mode. */
// (日本語訳: モックモードにおいて、本物のスクリーンショットの代わりとなる
//  軽量なプレースホルダー画像をその場で組み立てる)
export function buildPlaceholderScreenshotDataUrl(label: string): string {
  // SVG(ベクター画像)のマークアップを文字列として組み立てる
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
    <rect width="100%" height="100%" fill="#FFF9F2"/>
    <rect x="12" y="12" width="456" height="296" fill="#FFFFFF" stroke="#D9B892" stroke-width="2" rx="12"/>
    <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#2F2A25">${label}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#7A7168">モックスクリーンショット</text>
  </svg>`
  // SVG文字列を、そのまま<img src>等に使えるdata: URLへ変換する
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
