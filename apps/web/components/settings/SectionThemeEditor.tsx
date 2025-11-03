'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { SectionTheme } from '@/stores/sectionTheming';
import { SECTION_THEME_VARIANTS, ACCENT_COLORS } from './constants';
import { getThemePreviewColor } from '@/lib/utils/sectionTheme';

type SectionThemeEditorProps = {
  sectionId: string;
  sectionLabel: string;
  currentTheme: SectionTheme;
  onSave: (theme: SectionTheme) => void;
  onCancel: () => void;
};

export default function SectionThemeEditor({
  sectionId,
  sectionLabel,
  currentTheme,
  onSave,
  onCancel
}: SectionThemeEditorProps) {
  const [theme, setTheme] = useState<SectionTheme>(currentTheme);

  const handleSave = () => {
    onSave(theme);
  };

  return (
    <div className="mt-6 space-y-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
      <div>
        <h4 className="text-lg font-semibold text-white">Настройка темы: {sectionLabel}</h4>
        <p className="mt-1 text-sm text-neutral-400">
          Выберите вариант оформления и цветовую схему для этого раздела
        </p>
      </div>

      {/* Варианты оформления */}
      <section>
        <h5 className="text-sm font-semibold text-white mb-3">Вариант оформления</h5>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SECTION_THEME_VARIANTS.map((variant) => {
            const isSelected = theme.variant === variant.id;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setTheme({ ...theme, variant: variant.id })}
                className={clsx(
                  'relative overflow-hidden rounded-xl border p-4 text-left transition',
                  'min-h-[140px] flex flex-col',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-indigo-500/40'
                )}
              >
                <div className={clsx('mb-3 h-16 w-full rounded-lg flex-shrink-0', variant.previewClassName.split(' ')[2] || 'bg-neutral-800')} />
                <div className="flex-1 flex flex-col">
                  <p className={clsx('text-xs font-semibold', isSelected ? 'text-indigo-100' : 'text-white')}>
                    {variant.label}
                  </p>
                  <p className="mt-1 text-[10px] text-neutral-400">{variant.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Акцентный цвет (показываем только для accent и bordered) */}
      {(theme.variant === 'accent' || theme.variant === 'bordered') && (
        <section>
          <h5 className="text-sm font-semibold text-white mb-3">Акцентный цвет</h5>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => {
              const isSelected = theme.accentColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setTheme({ ...theme, accentColor: color.id })}
                  className={clsx(
                    'h-10 w-10 rounded-lg border-2 transition hover:scale-110',
                    isSelected
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-neutral-900'
                      : 'border-neutral-700'
                  )}
                  style={{ backgroundColor: getThemePreviewColor(color.id) }}
                  title={color.label}
                />
              );
            })}
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Выбранный цвет: <span className="text-white">{ACCENT_COLORS.find(c => c.id === theme.accentColor)?.label}</span>
          </p>
        </section>
      )}

      {/* Прозрачность (для accent и bordered) */}
      {(theme.variant === 'accent' || theme.variant === 'bordered') && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-semibold text-white">Прозрачность рамки</h5>
            <span className="text-xs text-neutral-400">{theme.borderOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.borderOpacity}
            onChange={(e) => setTheme({ ...theme, borderOpacity: Number(e.target.value) })}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </section>
      )}

      {/* Предпросмотр */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <h5 className="text-sm font-semibold text-white mb-3">Предпросмотр</h5>
        <div
          className={clsx(
            theme.variant === 'default' && 'space-y-6',
            theme.variant === 'minimal' && 'space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4',
            theme.variant === 'accent' &&
              `space-y-6 rounded-3xl border p-6 ${
                ACCENT_COLORS.find((c) => c.id === theme.accentColor)?.className || ''
              }`,
            theme.variant === 'bordered' &&
              `space-y-6 rounded-2xl border-2 bg-neutral-950/80 p-6 ${
                ACCENT_COLORS.find((c) => c.id === theme.accentColor)?.className || ''
              }`
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-lg font-semibold text-neutral-100">{sectionLabel}</h6>
              <p className="text-sm text-neutral-400">Описание раздела</p>
            </div>
            <button className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm">
              Действие
            </button>
          </div>
          <div className="mt-4 rounded-lg bg-neutral-800/60 p-4">
            <p className="text-sm text-neutral-300">Содержимое раздела</p>
          </div>
        </div>
      </section>

      {/* Кнопки действий */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl border border-indigo-500/60 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Применить
        </button>
      </div>
    </div>
  );
}

