/**
 * このファイルは何をするファイルか:
 * ビルドツール「electron-vite」の設定ファイルです。
 * Electronアプリの3つの部分(main=メインプロセス、preload=橋渡しスクリプト、
 * renderer=画面のReactコード)を、それぞれどうビルドするかを定義しています。
 *
 * このファイルの中でやっていること:
 * - `main`: `electron/main/index.ts` を入り口として、メインプロセス用のコードをビルドする
 * - `preload`: `electron/preload/index.ts` を入り口としてビルドする。
 *   package.jsonの`"type": "module"`設定の影響でESM形式(.mjs)として
 *   出力されてしまうと、Electronのpreloadローダーが読み込めず`window.mogulis`が
 *   undefinedになってしまう不具合があったため、明示的にCJS形式(.js)で
 *   出力するよう指定している
 * - `renderer`: 3つのウィンドウ(index.html/mascot.html/overlay.html)を
 *   それぞれ別のページとしてビルドする。`@renderer`や`@shared`という
 *   インポート時の別名(エイリアス)もここで定義している
 */

import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('electron/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('electron/preload/index.ts')
        },
        // Force CJS (.js) output — Electron's preload loader expects a
        // CommonJS file at this path; with package.json's "type": "module"
        // the default SSR build otherwise emits ESM as index.mjs, which
        // silently fails to load (leaving window.mogulis undefined).
        // (日本語訳: CJS形式(.js)での出力を強制する。Electronのpreloadローダーは
        //  このパスにCommonJS形式のファイルがあることを期待しているが、
        //  package.jsonの"type": "module"設定により、指定しないとESM形式の
        //  index.mjsとして出力されてしまい、読み込みに静かに失敗して
        //  window.mogulisがundefinedのままになってしまう)
        output: {
          format: 'cjs',
          entryFileNames: '[name].js'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        // 3つのウィンドウ(メイン/マスコット/範囲選択オーバーレイ)を、
        // それぞれ独立したページとしてビルドする
        input: {
          index: resolve('src/renderer/index.html'),
          mascot: resolve('src/renderer/mascot.html'),
          overlay: resolve('src/renderer/overlay.html')
        }
      }
    }
  }
})
