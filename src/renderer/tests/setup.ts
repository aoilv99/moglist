/**
 * このファイルは何をするファイルか:
 * Vitest(テストランナー)が全テストの実行前に読み込む、共通のセットアップファイルです。
 * `vitest.config.ts` の `setupFiles` で指定されています。
 *
 * このファイルの中でやっていること:
 * - `@testing-library/jest-dom` の拡張マッチャー(`toBeInTheDocument()`等)を
 *   Vitestで使えるように読み込むだけの、設定用の1行
 */

import '@testing-library/jest-dom/vitest'
