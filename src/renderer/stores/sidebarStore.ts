/**
 * このファイルは何をするファイルか:
 * メインウィンドウのサイドバーが「開いているか閉じているか」をZustandで管理するストアです。
 *
 * このファイルの中でやっていること:
 * - `isOpen`: サイドバーの開閉状態(既定は開いた状態)
 * - `toggle`: 開閉状態を反転させる
 * - `setOpen`: 開閉状態を直接指定する
 */

import { create } from 'zustand'

interface SidebarStoreState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarStoreState>((set) => ({
  isOpen: true,
  toggle: () => set((prev) => ({ isOpen: !prev.isOpen })),
  setOpen: (isOpen) => set({ isOpen })
}))
