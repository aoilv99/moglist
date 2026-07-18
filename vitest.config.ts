/**
 * このファイルは何をするファイルか:
 * テストランナー「Vitest」の設定ファイルです。`npx vitest run` で実行される
 * テストが、どの環境で・どのファイルを対象に動くかを定義しています。
 *
 * このファイルの中でやっていること:
 * - `@renderer` / `@shared` のインポート別名(エイリアス)を、本番ビルドと
 *   同じ設定でテストでも使えるようにする
 * - `environment: 'jsdom'`: ブラウザが無くても、ブラウザ相当のDOM環境をNode.js上で
 *   再現してテストできるようにする
 * - `globals: true`: `describe`/`it`/`expect` 等を、いちいちimportせずに使えるようにする
 * - `setupFiles`: 全テストの前に読み込む共通セットアップファイルを指定する
 * - `include`: `.test.ts` / `.test.tsx` という名前のファイルだけをテスト対象にする
 */

import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer'),
      '@shared': resolve('src/shared')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/tests/setup.ts'],
    include: ['src/renderer/**/*.test.{ts,tsx}']
  }
})
