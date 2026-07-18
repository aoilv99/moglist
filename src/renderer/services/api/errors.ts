import axios from 'axios'
import { ApiError, type ApiErrorResponse } from '@shared/types/api'

/** Normalizes any error thrown by axios (or elsewhere) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({
        code: 'NETWORK_ERROR',
        message: 'サーバーに接続できませんでした。ネットワーク接続を確認してください。'
      })
    }
    const data = error.response.data as Partial<ApiErrorResponse> | undefined
    if (data?.error) {
      return new ApiError(data.error)
    }
    if (error.response.status >= 500) {
      return new ApiError({
        code: 'SERVER_UNAVAILABLE',
        message: 'サーバーでエラーが発生しました。しばらくしてから再度お試しください。'
      })
    }
    return new ApiError({ code: 'UNKNOWN_ERROR', message: error.message })
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : '不明なエラーが発生しました。'
  })
}
