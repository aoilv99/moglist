/**
 * このファイルは何をするファイルか:
 * 設定画面(ルート `/settings`)を表示するページコンポーネントです。
 * ユーザー自身のGemini APIキーを入力・保存・削除し、接続テストできるようにします。
 * このキーはmainプロセス側で`safeStorage`により暗号化保存され、画面には値そのものを出しません。
 *
 * このファイルの中でやっていること:
 * - `useGeminiKeyStatus`: 現在キーが保存済みかどうかをバッジで表示する
 * - 入力欄は常に空から始まり、「変更する場合のみ入力してください」というUXにする
 * - 保存/接続テスト/削除の各ボタンで対応するミューテーションを呼び、結果をトースト表示する
 * - モックモード(`USE_MOCK_API`)中はこの設定が使われない旨を注記する
 */

import { useState } from 'react'
import { LoadingState } from '@renderer/components/feedback/LoadingState'
import { useToast } from '@renderer/components/feedback/ToastProvider'
import {
  useClearGeminiApiKey,
  useGeminiKeyStatus,
  useSaveGeminiApiKey,
  useTestGeminiApiKey
} from '@renderer/hooks/useGeminiSettings'
import { USE_MOCK_API } from '@renderer/services/api/client'

export function SettingsPage(): JSX.Element {
  const [inputKey, setInputKey] = useState('')
  const { showToast } = useToast()
  const { data: keyStatus, isLoading } = useGeminiKeyStatus()
  const saveKey = useSaveGeminiApiKey()
  const clearKey = useClearGeminiApiKey()
  const testKey = useTestGeminiApiKey()

  const handleSave = (): void => {
    if (!inputKey.trim()) {
      showToast('APIキーを入力してください。', 'error')
      return
    }
    saveKey.mutate(inputKey.trim(), {
      onSuccess: () => {
        setInputKey('')
        showToast('APIキーを保存しました。', 'success')
      },
      onError: () => showToast('APIキーの保存に失敗しました。', 'error')
    })
  }

  const handleTest = (): void => {
    const key = inputKey.trim()
    if (!key) {
      showToast('接続テストするキーを入力してください。', 'error')
      return
    }
    testKey.mutate(key, {
      onSuccess: (result) => showToast(result.message, result.ok ? 'success' : 'error'),
      onError: () => showToast('接続テストに失敗しました。', 'error')
    })
  }

  const handleClear = (): void => {
    clearKey.mutate(undefined, {
      onSuccess: () => showToast('APIキーを削除しました。', 'success'),
      onError: () => showToast('APIキーの削除に失敗しました。', 'error')
    })
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-lg font-bold text-text-base">設定</h1>

      {USE_MOCK_API && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          モックモードで動作中のため、ここで保存したAPIキーは画像解析には使われません。
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-secondary/40 bg-surface p-5">
        <div>
          <h2 className="text-sm font-semibold text-text-base">Gemini APIキー</h2>
          <p className="mt-1 text-xs text-muted">
            画像解析にはあなた自身のGemini APIキーを使用します。キーはこの端末内で暗号化して保存され、外部には送信されません。
          </p>
        </div>

        {isLoading ? (
          <LoadingState label="読み込み中…" />
        ) : (
          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${
              keyStatus?.configured ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
            }`}
          >
            {keyStatus?.configured ? '設定済み' : '未設定'}
          </span>
        )}

        <div className="space-y-2">
          <label htmlFor="gemini-api-key" className="text-xs font-medium text-muted">
            {keyStatus?.configured ? '新しいAPIキー(変更する場合のみ入力)' : 'APIキー'}
          </label>
          <input
            id="gemini-api-key"
            type="password"
            value={inputKey}
            onChange={(event) => setInputKey(event.target.value)}
            placeholder="AIza..."
            className="w-full rounded-xl border border-secondary/40 bg-background px-3 py-2 text-sm text-text-base outline-none focus:border-primary"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveKey.isPending}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            {saveKey.isPending ? '保存中…' : '保存'}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testKey.isPending}
            className="rounded-xl border border-secondary/40 px-4 py-2 text-sm font-medium text-text-base transition hover:bg-background disabled:opacity-50"
          >
            {testKey.isPending ? 'テスト中…' : '接続テスト'}
          </button>
          {keyStatus?.configured && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearKey.isPending}
              className="rounded-xl border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
            >
              削除
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
