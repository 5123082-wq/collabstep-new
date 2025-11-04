import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Варианты визуального стиля секции
export type SectionVariant = 'default' | 'elevated' | 'minimal' | 'bordered' | 'glass';

// Акцентные цвета для секций
export type SectionAccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'neutral';

// Уровни интенсивности
export type IntensityLevel = 'subtle' | 'base' | 'strong';

// Конфигурация темы секции
export type SectionTheme = {
  variant: SectionVariant;
  accentColor: SectionAccentColor;
  intensity: IntensityLevel;
  customClassName?: string;
};

// Значения по умолчанию
export const DEFAULT_SECTION_THEME: SectionTheme = {
  variant: 'default',
  accentColor: 'indigo',
  intensity: 'base',
};

// Предустановленные темы для быстрого доступа
export const PRESET_THEMES: Record<string, SectionTheme> = {
  default: DEFAULT_SECTION_THEME,
  card: {
    variant: 'elevated',
    accentColor: 'indigo',
    intensity: 'base',
  },
  minimal: {
    variant: 'minimal',
    accentColor: 'neutral',
    intensity: 'subtle',
  },
  accent: {
    variant: 'bordered',
    accentColor: 'indigo',
    intensity: 'strong',
  },
  success: {
    variant: 'bordered',
    accentColor: 'emerald',
    intensity: 'base',
  },
  warning: {
    variant: 'bordered',
    accentColor: 'amber',
    intensity: 'base',
  },
  danger: {
    variant: 'bordered',
    accentColor: 'rose',
    intensity: 'base',
  },
  glass: {
    variant: 'glass',
    accentColor: 'indigo',
    intensity: 'subtle',
  },
};

type SectionThemingState = {
  sectionThemes: Record<string, SectionTheme>;
  setSectionTheme: (sectionId: string, theme: SectionTheme) => void;
  getSectionTheme: (sectionId: string) => SectionTheme | null;
  applyPreset: (sectionId: string, presetName: keyof typeof PRESET_THEMES) => void;
  resetSectionTheme: (sectionId: string) => void;
  resetAll: () => void;
};

export const useSectionThemingStore = create<SectionThemingState>()(
  persist(
    (set, get) => ({
      sectionThemes: {},

      setSectionTheme: (sectionId, theme) => {
        set((state) => ({
          sectionThemes: { ...state.sectionThemes, [sectionId]: theme },
        }));
      },

      getSectionTheme: (sectionId) => {
        const state = get();
        return state.sectionThemes[sectionId] ?? null;
      },

      applyPreset: (sectionId, presetName) => {
        const preset = PRESET_THEMES[presetName];
        if (preset) {
          set((state) => ({
            sectionThemes: { ...state.sectionThemes, [sectionId]: preset },
          }));
        }
      },

      resetSectionTheme: (sectionId) =>
        set((state) => {
          const { [sectionId]: _, ...rest } = state.sectionThemes;
          return { sectionThemes: rest };
        }),

      resetAll: () => set({ sectionThemes: {} }),
    }),
    {
      name: 'cv-section-theming',
      version: 2, // Увеличили версию для миграции
    }
  )
);
