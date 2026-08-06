/**
 * このファイルは何をするファイルか:
 * axios通信で発生した様々な種類のエラーを、アプリ共通の `ApiError` 形式に
 * 変換(正規化)するための関数を定義するファイルです。
 * これにより、画面側は常に同じ形のエラーオブジェクトだけを扱えばよくなります。
 *
 * このファイルの中でやっていること:
 * - `toApiError`: 受け取ったエラーの種類を判定し、適切な`ApiError`に変換する
 *   1. 既に`ApiError`ならそのまま返す
 *   2. axiosのエラーで、レスポンス自体が無い(通信できなかった)なら「ネットワークエラー」
 *   3. バックエンドが返したエラー形式(ApiErrorResponse)があれば、それをそのまま使う
 *   4. HTTPステータスが500番台なら「サーバーエラー」
 *   5. それ以外のaxiosエラーは「不明なエラー」として、元のメッセージを使う
 *   6. axios以外の予期しないエラーも、最終的に「不明なエラー」として包む
 */

import axios from 'axios'
import { ApiError, type ApiErrorResponse } from '@shared/types/api'

/** Normalizes any error thrown by axios (or elsewhere) into an ApiError. */
// (日本語訳: axios(やその他の場所)で投げられたあらゆるエラーを、ApiErrorへ正規化する)
export function toApiError(error: unknown): ApiError {
  // 既にApiErrorであれば、変換不要でそのまま返す
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    // レスポンス自体が無い = サーバーに到達できなかった(オフライン等)
    if (!error.response) {
      return new ApiError({
        code: 'NETWORK_ERROR',
        message: 'サーバーに接続できませんでした。ネットワーク接続を確認してください。'
      })
    }
    // バックエンドが共通エラー形式(ApiErrorResponse)でエラー内容を返している場合、それを使う
    const data = error.response.data as Partial<ApiErrorResponse> | undefined
    if (data?.error) {
      return new ApiError(data.error)
    }
    // 500番台のエラーはサーバー側の問題として扱う
    if (error.response.status >= 500) {
      return new ApiError({
        code: 'SERVER_UNAVAILABLE',
        message: 'サーバーでエラーが発生しました。しばらくしてから再度お試しください。'
      })
    }
    // それ以外のケースは、axiosのエラーメッセージをそのまま使う
    return new ApiError({ code: 'UNKNOWN_ERROR', message: error.message })
  }

  // axios以外の予期しないエラーも、最終的にApiErrorへ変換して返す
  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : '不明なエラーが発生しました。'
  })
}
