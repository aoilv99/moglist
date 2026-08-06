/**
 * このファイルは何をするファイルか:
 * ユーザーが入力したGemini APIキーを、OSの資格情報機構(`safeStorage`)で
 * 暗号化してディスクに保存・読み込み・削除するためのファイルです。
 * キーはrendererには渡さず、mainプロセス内(`geminiClient.ts`)でのみ使われます。
 *
 * このファイルの中でやっていること:
 * - `saveApiKey`: キーを`safeStorage.encryptString`で暗号化し、Base64化してファイルに書き込む
 * - `getApiKey`: ファイルを読み込み、`safeStorage.decryptString`で復号する
 * - `clearApiKey`: 保存ファイルを削除する
 * - `hasApiKey`: 復号せず、ファイルの有無だけを軽量にチェックする(設定画面のステータス表示用)
 */

import { app, safeStorage } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

function keyFilePath(): string {
  return path.join(app.getPath('userData'), 'gemini-key.enc')
}

/** キーを暗号化してファイルに保存する */
export async function saveApiKey(key: string): Promise<void> {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('この環境ではAPIキーの暗号化保存が利用できません。')
  }
  const encrypted = safeStorage.encryptString(key)
  await fs.writeFile(keyFilePath(), encrypted.toString('base64'), 'utf-8')
}

/** 保存済みのキーを復号して取得する(未保存ならnull) */
export async function getApiKey(): Promise<string | null> {
  if (!safeStorage.isEncryptionAvailable()) return null
  try {
    const base64 = await fs.readFile(keyFilePath(), 'utf-8')
    return safeStorage.decryptString(Buffer.from(base64, 'base64'))
  } catch {
    // ファイルが無い、または復号に失敗した場合は「未保存」として扱う
    return null
  }
}

/** 保存済みのキーを削除する(元々無ければ何もしない) */
export async function clearApiKey(): Promise<void> {
  await fs.rm(keyFilePath(), { force: true })
}

/** キーが保存されているかどうかだけを、復号せず軽量に確認する */
export async function hasApiKey(): Promise<boolean> {
  try {
    await fs.access(keyFilePath())
    return true
  } catch {
    return false
  }
}
