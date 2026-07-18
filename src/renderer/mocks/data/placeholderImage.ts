/** Builds a lightweight inline placeholder image standing in for a real screenshot in mock mode. */
export function buildPlaceholderScreenshotDataUrl(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
    <rect width="100%" height="100%" fill="#FFF9F2"/>
    <rect x="12" y="12" width="456" height="296" fill="#FFFFFF" stroke="#D9B892" stroke-width="2" rx="12"/>
    <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#2F2A25">${label}</text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#7A7168">モックスクリーンショット</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
