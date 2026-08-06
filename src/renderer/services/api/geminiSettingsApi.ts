/**
 * このファイルは何をするファイルか:
 * Gemini APIキーの保存・削除・接続テスト・保存状態確認を行う関数をまとめたファイルです。
 * axiosではなく、Electronのmainプロセスへ`window.mogulis`経由(IPC)で処理を依頼します。
 */

import type { GeminiKeyStatus, GeminiKeyTestResult } from '@shared/types/gemini'

export async function getGeminiKeyStatus(): Promise<GeminiKeyStatus> {
  return window.mogulis.getGeminiKeyStatus()
}

export async function saveGeminiApiKey(key: string): Promise<void> {
  return window.mogulis.saveGeminiApiKey(key)
}

export async function clearGeminiApiKey(): Promise<void> {
  return window.mogulis.clearGeminiApiKey()
}

export async function testGeminiApiKey(key: string): Promise<GeminiKeyTestResult> {
  return window.mogulis.testGeminiApiKey(key)
}
