/**
 * このファイルは何をするファイルか:
 * マスコット(もぐた)の「見た目の状態」と「メニューが開いているかどうか」を
 * Zustandで管理するストアです。マスコットウィンドウのReactアプリだけで使われます。
 *
 * このファイルの中でやっていること:
 * - `MascotState`: idle(通常)/drag-over(ドラッグされている)/eating(食べている)/
 *   thinking(考え中)/success(成功)/error(失敗)の6状態を表す型
 * - `useMascotStore`: 現在の状態・メニュー開閉フラグと、それらを変更する関数を提供する
 */

import { create } from 'zustand'

export type MascotState = 'idle' | 'drag-over' | 'eating' | 'thinking' | 'success' | 'error'

interface MascotStoreState {
  state: MascotState
  menuOpen: boolean
  setState: (state: MascotState) => void
  setMenuOpen: (open: boolean) => void
  toggleMenu: () => void
}

/** Local to the mascot window renderer — not shared with the main window process. */
// (日本語訳: マスコットウィンドウのレンダラー内だけで使われる。メインウィンドウの
//  プロセスとは共有されない(別々のウィンドウ=別々のJS実行環境のため))
export const useMascotStore = create<MascotStoreState>((set) => ({
  state: 'idle',
  menuOpen: false,
  setState: (state) => set({ state }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleMenu: () => set((prev) => ({ menuOpen: !prev.menuOpen }))
}))
