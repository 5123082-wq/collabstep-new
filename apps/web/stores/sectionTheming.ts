import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SectionTheme = {
  variant: 'default' | 'accent' | 'minimal' | 'bordered';
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  borderOpacity: number; // 0-100
  bgOpacity: number; // 0-100
  customClassName?: string;
};

export const DEFAULT_THEME: SectionTheme = {
  variant: 'default',
  accentColor: 'indigo',
  borderOpacity: 100,
  bgOpacity: 60
};

type SectionThemingState = {
  sectionThemes: Record<string, SectionTheme>;
  setSectionTheme: (sectionId: string, theme: SectionTheme) => void;
  getSectionTheme: (sectionId: string) => SectionTheme | null;
  resetSectionTheme: (sectionId: string) => void;
  resetAll: () => void;
};

export const useSectionThemingStore = create<SectionThemingState>()(
  persist(
    (set, get) => ({
      sectionThemes: {},
      
      setSectionTheme: (sectionId, theme) =>
        set((state) => ({
          sectionThemes: { ...state.sectionThemes, [sectionId]: theme }
        })),
      
      getSectionTheme: (sectionId) => {
        const state = get();
        return state.sectionThemes[sectionId] ?? null;
      },
      
      resetSectionTheme: (sectionId) =>
        set((state) => {
          const { [sectionId]: _, ...rest } = state.sectionThemes;
          return { sectionThemes: rest };
        }),
      
      resetAll: () => set({ sectionThemes: {} })
    }),
    { name: 'cv-section-theming' }
  )
);

