/**
 * このファイルは何をするファイルか:
 * アプリ全体の簡易的な設定値をZustandで管理するストアです。
 * 本格的な設定画面(/settings)はまだ未実装のため、今のところは通知のON/OFFのみです。
 *
 * このファイルの中でやっていること:
 * - `notificationsEnabled`: 通知を有効にするかどうかのフラグ(既定は有効)
 * - `setNotificationsEnabled`: フラグを変更する
 */

import { create } from 'zustand'

interface AppSettingsState {
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

/** Minimal app-wide settings. The full /settings screen is a later phase (see README). */
// (日本語訳: 最小限のアプリ全体設定。本格的な/settings画面は次フェーズで実装予定(README参照))
export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  notificationsEnabled: true,
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled })
}))
