import { create } from 'zustand'

interface AppSettingsState {
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
}

/** Minimal app-wide settings. The full /settings screen is a later phase (see README). */
export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  notificationsEnabled: true,
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled })
}))
