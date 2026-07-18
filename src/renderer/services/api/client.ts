/**
 * このファイルは何をするファイルか:
 * 実APIと通信するためのaxios(HTTP通信ライブラリ)インスタンスと、
 * モックAPIを使うかどうかの判定フラグを定義するファイルです。
 * 他のAPIサービスファイル(taskApi.ts等)はすべてこのファイルを経由します。
 *
 * このファイルの中でやっていること:
 * - `API_BASE_URL`: `.env`の`VITE_API_BASE_URL`からAPIのベースURLを読み込む
 *   (未設定ならlocalhostの既定値を使う)
 * - `USE_MOCK_API`: `.env`の`VITE_USE_MOCK_API`が"true"かどうかで、
 *   モックAPI/実APIのどちらを使うかを判定する
 * - `httpClient`: 実APIと通信する際に使う、共通設定済みのaxiosインスタンス
 *   (タイムアウトを15秒に設定)
 */

import axios from 'axios'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

// 環境変数の値(文字列)を真偽値に変換する。"true"という文字列の時だけモックモードにする
export const USE_MOCK_API: boolean = import.meta.env.VITE_USE_MOCK_API === 'true'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})
