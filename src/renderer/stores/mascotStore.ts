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
export const useMascotStore = create<MascotStoreState>((set) => ({
  state: 'idle',
  menuOpen: false,
  setState: (state) => set({ state }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleMenu: () => set((prev) => ({ menuOpen: !prev.menuOpen }))
}))
