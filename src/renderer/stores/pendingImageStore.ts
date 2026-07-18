import { create } from 'zustand'

export interface PendingImage {
  file: File
  previewUrl: string
}

interface PendingImageState {
  pendingImage: PendingImage | null
  setPendingImage: (image: PendingImage | null) => void
}

/** The image awaiting analysis on the `/analyzing` screen (from drop or screenshot). */
export const usePendingImageStore = create<PendingImageState>((set) => ({
  pendingImage: null,
  setPendingImage: (pendingImage) => set({ pendingImage })
}))
