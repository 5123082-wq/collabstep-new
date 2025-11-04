import type { SectionTheme } from '@/stores/sectionTheming';

/**
 * Получает цвет для предпросмотра темы
 */
export function getThemePreviewColor(color: SectionTheme['accentColor']): string {
  const colorMap: Record<SectionTheme['accentColor'], string> = {
    indigo: '#6366f1',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    neutral: '#94a3b8',
  };
  return colorMap[color] || colorMap.indigo;
}

/**
 * Генерирует классы для секции на основе темы
 * @deprecated Используйте generateSectionClassName из @/lib/theming/section-theme-utils
 */
export function generateSectionClassName(theme: SectionTheme | null): string {
  if (!theme || theme.customClassName) {
    return theme?.customClassName || 'space-y-6';
  }

  const baseClasses: Record<SectionTheme['variant'], string> = {
    default: 'space-y-6',
    minimal: 'space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4',
    elevated: 'space-y-6 rounded-3xl border border-neutral-800 bg-neutral-950/70 p-6 shadow-lg',
    bordered: 'space-y-6 rounded-2xl border-2 bg-neutral-950/80 p-6',
    glass: 'space-y-6 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 backdrop-blur-xl',
  };

  return baseClasses[theme.variant];
}

/**
 * Получает inline стили для темы секции
 * @deprecated Используйте getSectionThemeStyles из @/lib/theming/section-theme-utils
 */
export function getSectionThemeStyles(
  theme: SectionTheme | null
): React.CSSProperties | undefined {
  if (!theme) {
    return undefined;
  }

  const styles: React.CSSProperties = {};

  // Для bordered варианта применяем цвет рамки
  if (theme.variant === 'bordered') {
    const color = getThemePreviewColor(theme.accentColor);
    const opacity = theme.intensity === 'subtle' ? 0.3 : theme.intensity === 'strong' ? 0.7 : 0.5;
    styles.borderColor = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }

  // Применяем интенсивность
  if (theme.intensity === 'subtle') {
    styles.opacity = 0.9;
  } else if (theme.intensity === 'strong') {
    styles.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  }

  return Object.keys(styles).length > 0 ? styles : undefined;
}
