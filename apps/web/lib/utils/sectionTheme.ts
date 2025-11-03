import type { SectionTheme } from '@/stores/sectionTheming';

/**
 * Получает CSS классы для акцентного цвета с учетом прозрачности
 * Используем inline стили для точного контроля прозрачности
 */
export function getAccentColorStyles(
  color: SectionTheme['accentColor'],
  borderOpacity: number,
  bgOpacity: number
): { borderColor: string; backgroundColor: string } {
  const colorMap: Record<SectionTheme['accentColor'], { border: string; bg: string }> = {
    indigo: { border: '#6366f1', bg: '#6366f1' },
    emerald: { border: '#10b981', bg: '#10b981' },
    amber: { border: '#f59e0b', bg: '#f59e0b' },
    rose: { border: '#f43f5e', bg: '#f43f5e' },
    blue: { border: '#3b82f6', bg: '#3b82f6' },
    purple: { border: '#8b5cf6', bg: '#8b5cf6' }
  };

  const colors = colorMap[color] || colorMap.indigo;

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  return {
    borderColor: hexToRgba(colors.border, borderOpacity / 100),
    backgroundColor: hexToRgba(colors.bg, bgOpacity / 1000) // bg более прозрачный
  };
}

/**
 * Генерирует классы для секции на основе темы
 */
export function generateSectionClassName(theme: SectionTheme | null): string {
  if (!theme || theme.customClassName) {
    return theme?.customClassName || 'space-y-6';
  }

  const baseClasses = {
    default: 'space-y-6',
    minimal: 'space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4',
    accent: 'space-y-6 rounded-3xl border p-6',
    bordered: 'space-y-6 rounded-2xl border-2 bg-neutral-950/80 p-6'
  };

  return baseClasses[theme.variant];
}

/**
 * Получает inline стили для вариантов accent и bordered
 */
export function getSectionThemeStyles(
  theme: SectionTheme | null
): { borderColor?: string; backgroundColor?: string } | undefined {
  if (!theme || (theme.variant !== 'accent' && theme.variant !== 'bordered')) {
    return undefined;
  }

  return getAccentColorStyles(theme.accentColor, theme.borderOpacity, theme.bgOpacity);
}

/**
 * Получает цвет для предпросмотра
 */
export function getThemePreviewColor(color: SectionTheme['accentColor']): string {
  const colorMap: Record<SectionTheme['accentColor'], string> = {
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    blue: '#3b82f6',
    purple: '#8b5cf6'
  };
  return colorMap[color] || colorMap.indigo;
}

