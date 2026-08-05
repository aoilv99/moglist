/**
 * このファイルは何をするファイルか:
 * ドラッグ&ドロップやスクリーンショットで得た画像ファイルが、
 * 「対応している形式か」「サイズが大きすぎないか」をチェックする関数を定義するファイルです。
 *
 * このファイルの中でやっていること:
 * - `validateImageFile`: ファイルのMIMEタイプとサイズを、定数(shared/constants)で
 *   定義された条件と比較し、問題があればエラーコード・メッセージ付きで返す
 */

import { ACCEPTED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from '@shared/constants'

// バリデーション結果の型(okがfalseの場合はcode/messageに理由が入る)
export interface ImageValidationResult {
  ok: boolean
  code?: 'UNSUPPORTED_FILE_TYPE' | 'FILE_TOO_LARGE'
  message?: string
}

export function validateImageFile(file: Pick<File, 'type' | 'size'>): ImageValidationResult {
  // 対応形式(PNG/JPEG/WEBP)以外は拒否する
  if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number])) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FILE_TYPE',
      message: '対応していないファイル形式です（PNG・JPG・JPEG・WEBPのみ）'
    }
  }
  // 10MBを超えるファイルは拒否する
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      ok: false,
      code: 'FILE_TOO_LARGE',
      message: 'ファイルサイズが大きすぎます（最大10MB）'
    }
  }
  return { ok: true }
}
