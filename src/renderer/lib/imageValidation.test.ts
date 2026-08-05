/**
 * このファイルは何をするファイルか:
 * `imageValidation.ts` の `validateImageFile` が正しく動くかを確認する
 * 単体テストファイルです。
 *
 * このファイルの中でやっていること:
 * - 対応形式(png/jpeg/webp)かつサイズ内であれば合格することを確認する
 * - 非対応形式(pdf等)は不合格になり、正しいエラーコードが返ることを確認する
 * - 10MBを超えるファイルは不合格になり、正しいエラーコードが返ることを確認する
 */

import { describe, expect, it } from 'vitest'
import { validateImageFile } from './imageValidation'

describe('validateImageFile', () => {
  it('accepts png/jpg/jpeg/webp within the size limit', () => {
    // 対応形式でサイズも小さければ、すべて合格(ok: true)になることを確認する
    expect(validateImageFile({ type: 'image/png', size: 1024 }).ok).toBe(true)
    expect(validateImageFile({ type: 'image/jpeg', size: 1024 }).ok).toBe(true)
    expect(validateImageFile({ type: 'image/webp', size: 1024 }).ok).toBe(true)
  })

  it('rejects unsupported file types', () => {
    // PDF等の非対応形式は不合格になり、UNSUPPORTED_FILE_TYPEが返ることを確認する
    const result = validateImageFile({ type: 'application/pdf', size: 1024 })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('UNSUPPORTED_FILE_TYPE')
  })

  it('rejects files larger than 10MB', () => {
    // 10MBを超えるファイルは不合格になり、FILE_TOO_LARGEが返ることを確認する
    const result = validateImageFile({ type: 'image/png', size: 11 * 1024 * 1024 })
    expect(result.ok).toBe(false)
    expect(result.code).toBe('FILE_TOO_LARGE')
  })
})
