import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UiState = {
  bgPreset: 'mesh' | 'grid' | 'halo';
  setBgPreset: (v: UiState['bgPreset']) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      bgPreset: 'mesh',
      setBgPreset: (v) => set({ bgPreset: v })
    }),
    { name: 'cv-ui' }
  )
);
