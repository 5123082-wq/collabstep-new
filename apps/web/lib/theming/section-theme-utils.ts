import type { SectionTheme, SectionAccentColor } from '@/stores/sectionTheming';

// Маппинг акцентных цветов на CSS-переменные
const ACCENT_COLOR_VARS: Record<SectionAccentColor, string> = {
  indigo: 'indigo',
  emerald: 'emerald',
  amber: 'amber',
  rose: 'rose',
  blue: 'blue',
  purple: 'purple',
  neutral: 'neutral',
};

// Генерация CSS-классов для секции на основе темы
export function generateSectionClassName(theme: SectionTheme | null): string {
  if (!theme) {
    return 'cs-section cs-section--default';
  }

  const classes = ['cs-section'];
  classes.push(`cs-section--${theme.variant}`);
  classes.push(`cs-section--${theme.accentColor}`);
  classes.push(`cs-section--${theme.intensity}`);

  if (theme.customClassName) {
    classes.push(theme.customClassName);
  }

  return classes.join(' ');
}

// Генерация inline-стилей для секции (если нужны кастомные значения)
export function getSectionThemeStyles(theme: SectionTheme | null): React.CSSProperties {
  if (!theme) {
    return {};
  }

  const styles: React.CSSProperties = {
    // @ts-ignore - CSS custom properties
    '--section-accent': ACCENT_COLOR_VARS[theme.accentColor],
  };

  return styles;
}

// Генерация data-атрибутов для секции
export function getSectionThemeDataAttrs(theme: SectionTheme | null): Record<string, string> {
  if (!theme) {
    return {};
  }

  return {
    'data-section-variant': theme.variant,
    'data-section-accent': theme.accentColor,
    'data-section-intensity': theme.intensity,
  };
}

// Утилита для получения Tailwind-классов вместо кастомных
export function getSectionTailwindClasses(theme: SectionTheme | null): string {
  if (!theme) {
    return 'space-y-6';
  }

  const { variant, accentColor, intensity } = theme;

  // Базовые классы для всех вариантов
  const baseClasses = ['transition-all', 'duration-200'];

  // Специфичные классы для каждого варианта
  switch (variant) {
    case 'elevated':
      baseClasses.push(
        'rounded-3xl',
        'border',
        'border-[var(--border-base)]',
        'bg-[var(--surface-elevated)]',
        'p-6',
        'shadow-lg',
        'shadow-black/10'
      );
      break;

    case 'minimal':
      baseClasses.push(
        'rounded-2xl',
        'border',
        'border-[var(--border-subtle)]',
        'bg-[var(--surface-muted)]',
        'p-4',
        intensity === 'subtle' ? 'opacity-90' : ''
      );
      break;

    case 'bordered':
      baseClasses.push(
        'rounded-2xl',
        'border-2',
        intensity === 'strong' ? 'border-[var(--accent-border-strong)]' : 'border-[var(--accent-border)]',
        'bg-[var(--surface-base)]',
        'p-6'
      );
      break;

    case 'glass':
      baseClasses.push(
        'rounded-3xl',
        'border',
        'border-[var(--border-subtle)]',
        'backdrop-blur-xl',
        'bg-[var(--surface-base)]',
        'p-6',
        'shadow-2xl',
        'shadow-black/20'
      );
      break;

    case 'default':
    default:
      baseClasses.push('space-y-6');
      break;
  }

  return baseClasses.filter(Boolean).join(' ');
}

// Получение цветовой схемы для акцентного цвета
export function getAccentColorScheme(color: SectionAccentColor) {
  const schemes = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.12)',
      bgHover: 'rgba(99, 102, 241, 0.18)',
      border: 'rgba(99, 102, 241, 0.55)',
      borderHover: 'rgba(99, 102, 241, 0.75)',
      text: '#a5b4fc',
      textStrong: '#6366f1',
    },
    emerald: {
      bg: 'rgba(34, 197, 94, 0.12)',
      bgHover: 'rgba(34, 197, 94, 0.18)',
      border: 'rgba(34, 197, 94, 0.55)',
      borderHover: 'rgba(34, 197, 94, 0.75)',
      text: '#86efac',
      textStrong: '#22c55e',
    },
    amber: {
      bg: 'rgba(251, 191, 36, 0.12)',
      bgHover: 'rgba(251, 191, 36, 0.18)',
      border: 'rgba(251, 191, 36, 0.55)',
      borderHover: 'rgba(251, 191, 36, 0.75)',
      text: '#fcd34d',
      textStrong: '#fbbf24',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.12)',
      bgHover: 'rgba(244, 63, 94, 0.18)',
      border: 'rgba(244, 63, 94, 0.55)',
      borderHover: 'rgba(244, 63, 94, 0.75)',
      text: '#fda4af',
      textStrong: '#f43f5e',
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.12)',
      bgHover: 'rgba(59, 130, 246, 0.18)',
      border: 'rgba(59, 130, 246, 0.55)',
      borderHover: 'rgba(59, 130, 246, 0.75)',
      text: '#93c5fd',
      textStrong: '#3b82f6',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.12)',
      bgHover: 'rgba(168, 85, 247, 0.18)',
      border: 'rgba(168, 85, 247, 0.55)',
      borderHover: 'rgba(168, 85, 247, 0.75)',
      text: '#d8b4fe',
      textStrong: '#a855f7',
    },
    neutral: {
      bg: 'rgba(148, 163, 184, 0.12)',
      bgHover: 'rgba(148, 163, 184, 0.18)',
      border: 'rgba(148, 163, 184, 0.45)',
      borderHover: 'rgba(148, 163, 184, 0.65)',
      text: '#cbd5e1',
      textStrong: '#94a3b8',
    },
  };

  return schemes[color];
}

