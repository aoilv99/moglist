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
