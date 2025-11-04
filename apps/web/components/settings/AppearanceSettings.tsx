'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { SectionTheme } from '@/stores/sectionTheming';
import { useSectionThemingStore, DEFAULT_SECTION_THEME } from '@/stores/sectionTheming';
import { GLOBAL_SECTIONS, ACCENT_COLORS } from './constants';
import { getThemePreviewColor } from '@/lib/utils/sectionTheme';
import SectionThemeEditor from './SectionThemeEditor';

type AppearanceSettingsProps = {
  onSelectSection?: (sectionId: string | null) => void;
};

export default function AppearanceSettings({ onSelectSection }: AppearanceSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const { sectionThemes, setSectionTheme, resetSectionTheme, getSectionTheme } = useSectionThemingStore();

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return GLOBAL_SECTIONS;
    const query = searchQuery.toLowerCase();
    return GLOBAL_SECTIONS.filter((s) => s.label.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelectSection = (sectionId: string) => {
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      onSelectSection?.(null);
    } else {
      setSelectedSectionId(sectionId);
      onSelectSection?.(sectionId);
    }
  };

  const handleSaveTheme = (sectionId: string, theme: SectionTheme) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[AppearanceSettings] Saving theme for section:', sectionId, 'Theme:', theme);
    }
    setSectionTheme(sectionId, theme);
    
    // Проверяем что тема сохранилась
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const saved = useSectionThemingStore.getState().getSectionTheme(sectionId);
        console.log('[AppearanceSettings] Theme saved, verifying:', saved);
      }, 100);
    }
    
    setSelectedSectionId(null);
    onSelectSection?.(null);
  };

  const handleCancelEdit = () => {
    setSelectedSectionId(null);
    onSelectSection?.(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white">Оформление разделов</h3>
        <p className="mt-1 text-sm text-neutral-400">
          Настройте индивидуальную тему для каждого раздела платформы. Это поможет вам быстрее
          ориентироваться в интерфейсе.
        </p>
      </div>

      {/* Поиск */}
      <div className="relative">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск раздела..."
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
        />
        <svg
          aria-hidden="true"
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Список разделов */}
      <div className="space-y-3">
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-8 text-center">
            <p className="text-sm text-neutral-400">Разделы не найдены</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const theme = sectionThemes[section.id] ?? DEFAULT_SECTION_THEME;
            const isSelected = selectedSectionId === section.id;
            const hasCustomTheme = !!sectionThemes[section.id];
            const themeLabel =
              theme.variant === 'accent'
                ? `Акцентный · ${ACCENT_COLORS.find((c) => c.id === theme.accentColor)?.label}`
                : theme.variant === 'minimal'
                  ? 'Минималистичный'
                  : theme.variant === 'bordered'
                    ? 'С рамкой'
                    : 'По умолчанию';

            return (
              <div key={section.id}>
                <div
                  className={clsx(
                    'rounded-2xl border p-4 transition cursor-pointer',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                  )}
                  onClick={() => handleSelectSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Иконка раздела */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900/80">
                        <span className="text-lg">📊</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{section.label}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{themeLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Мини-превью темы */}
                      <div
                        className={clsx(
                          'h-8 w-8 rounded-lg border',
                          theme.variant === 'accent' || theme.variant === 'bordered'
                            ? 'border-2'
                            : 'border'
                        )}
                        style={{
                          backgroundColor:
                            theme.variant === 'accent' || theme.variant === 'bordered'
                              ? `${getThemePreviewColor(theme.accentColor)}33`
                              : 'transparent',
                          borderColor:
                            theme.variant === 'accent' || theme.variant === 'bordered'
                              ? getThemePreviewColor(theme.accentColor)
                              : 'rgba(255, 255, 255, 0.1)'
                        }}
                      />

                      {hasCustomTheme && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetSectionTheme(section.id);
                          }}
                          className="rounded-lg px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                          title="Сбросить к умолчанию"
                        >
                          Сбросить
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Редактор темы (показываем при выборе) */}
                {isSelected && (
                  <SectionThemeEditor
                    sectionId={section.id}
                    sectionLabel={section.label}
                    currentTheme={theme}
                    onSave={(newTheme) => handleSaveTheme(section.id, newTheme)}
                    onCancel={handleCancelEdit}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Информация */}
      {sectionThemes && Object.keys(sectionThemes).length > 0 && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <p className="text-xs text-neutral-400">
            Настроено разделов: <span className="text-white">{Object.keys(sectionThemes).length}</span>. 
            Тема применяется ко всем страницам в разделе.
          </p>
        </div>
      )}
    </div>
  );
}

