export type ThemeName = 'dark' | 'light';

// Семантические токены для различных элементов интерфейса
type SemanticTokens = {
  // Основные поверхности
  surface: {
    canvas: string;
    base: string;
    elevated: string;
    muted: string;
    popover: string;
    overlay: string;
  };
  // Границы
  border: {
    subtle: string;
    base: string;
    strong: string;
  };
  // Текст
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
  };
  // Акцентные цвета
  accent: {
    bg: string;
    bgStrong: string;
    border: string;
    borderStrong: string;
    text: string;
    textStrong: string;
  };
  // Кнопки
  button: {
    primaryBg: string;
    primaryBgHover: string;
    primaryBgActive: string;
    primaryBorder: string;
    primaryText: string;
    secondaryBg: string;
    secondaryBgHover: string;
    secondaryBorder: string;
    secondaryText: string;
    ghostBg: string;
    ghostBgHover: string;
    ghostText: string;
    dangerBg: string;
    dangerBgHover: string;
    dangerBgActive: string;
    dangerBorder: string;
    dangerText: string;
  };
  // Интерактивные элементы
  interactive: {
    bg: string;
    bgHover: string;
    bgActive: string;
    border: string;
    borderHover: string;
    text: string;
  };
  // Статусы
  status: {
    successBg: string;
    successBorder: string;
    successText: string;
    warningBg: string;
    warningBorder: string;
    warningText: string;
    errorBg: string;
    errorBorder: string;
    errorText: string;
    infoBg: string;
    infoBorder: string;
    infoText: string;
  };
};

type SpacingTokens = {
  contentInlinePadding: string;
  railCollapsedWidth: string;
  railDockSpacing: string;
  railSafeGap: string;
  railSafeArea: string;
};

type ThemeTokens = SemanticTokens & SpacingTokens;

type DesignTokens = {
  themes: Record<ThemeName, ThemeTokens>;
};

export const designTokens: DesignTokens = {
  themes: {
    dark: {
      // Поверхности
      surface: {
        canvas: '#040712',
        base: 'rgba(9, 13, 23, 0.92)',
        elevated: 'rgba(15, 23, 42, 0.95)',
        muted: 'rgba(12, 18, 30, 0.85)',
        popover: 'rgba(11, 16, 27, 0.96)',
        overlay: 'rgba(4, 7, 18, 0.68)',
      },
      // Границы
      border: {
        subtle: 'rgba(148, 163, 184, 0.24)',
        base: 'rgba(148, 163, 184, 0.35)',
        strong: 'rgba(165, 180, 203, 0.45)',
      },
      // Текст
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5f5',
        tertiary: '#94a3b8',
        muted: '#64748b',
        inverse: '#0f172a',
      },
      // Акценты
      accent: {
        bg: 'rgba(99, 102, 241, 0.16)',
        bgStrong: 'rgba(99, 102, 241, 0.22)',
        border: 'rgba(129, 140, 248, 0.55)',
        borderStrong: 'rgba(99, 102, 241, 0.75)',
        text: '#a5b4fc',
        textStrong: '#c7d2fe',
      },
      // Кнопки
      button: {
        primaryBg: '#6366f1',
        primaryBgHover: '#4f46e5',
        primaryBgActive: '#4338ca',
        primaryBorder: '#4f46e5',
        primaryText: '#ffffff',
        secondaryBg: 'rgba(15, 23, 42, 0.72)',
        secondaryBgHover: 'rgba(30, 41, 59, 0.85)',
        secondaryBorder: 'rgba(148, 163, 184, 0.38)',
        secondaryText: '#cbd5f5',
        ghostBg: 'transparent',
        ghostBgHover: 'rgba(99, 102, 241, 0.12)',
        ghostText: '#cbd5f5',
        dangerBg: '#ef4444',
        dangerBgHover: '#dc2626',
        dangerBgActive: '#b91c1c',
        dangerBorder: '#f87171',
        dangerText: '#ffffff',
      },
      // Интерактивные элементы
      interactive: {
        bg: 'rgba(15, 23, 42, 0.72)',
        bgHover: 'rgba(30, 41, 59, 0.85)',
        bgActive: 'rgba(51, 65, 85, 0.92)',
        border: 'rgba(99, 102, 241, 0.42)',
        borderHover: 'rgba(129, 140, 248, 0.75)',
        text: '#cbd5ff',
      },
      // Статусы
      status: {
        successBg: 'rgba(34, 197, 94, 0.16)',
        successBorder: 'rgba(34, 197, 94, 0.55)',
        successText: '#86efac',
        warningBg: 'rgba(251, 191, 36, 0.16)',
        warningBorder: 'rgba(251, 191, 36, 0.55)',
        warningText: '#fcd34d',
        errorBg: 'rgba(239, 68, 68, 0.16)',
        errorBorder: 'rgba(239, 68, 68, 0.55)',
        errorText: '#fca5a5',
        infoBg: 'rgba(59, 130, 246, 0.16)',
        infoBorder: 'rgba(59, 130, 246, 0.55)',
        infoText: '#93c5fd',
      },
      // Spacing (общие для всех тем)
      contentInlinePadding: '20px',
      railCollapsedWidth: '56px',
      railDockSpacing: '1rem',
      railSafeGap: '5px',
      railSafeArea: 'calc(56px + 1rem + 5px)',
    },
    light: {
      // Поверхности
      surface: {
        canvas: '#f4f6fb',
        base: 'rgba(255, 255, 255, 0.96)',
        elevated: 'rgba(255, 255, 255, 0.98)',
        muted: 'rgba(241, 245, 249, 0.92)',
        popover: 'rgba(255, 255, 255, 0.98)',
        overlay: 'rgba(15, 23, 42, 0.45)',
      },
      // Границы
      border: {
        subtle: 'rgba(148, 163, 184, 0.28)',
        base: 'rgba(148, 163, 184, 0.45)',
        strong: 'rgba(100, 116, 139, 0.55)',
      },
      // Текст
      text: {
        primary: '#0f172a',
        secondary: '#1f2937',
        tertiary: '#334155',
        muted: '#64748b',
        inverse: '#ffffff',
      },
      // Акценты
      accent: {
        bg: 'rgba(99, 102, 241, 0.12)',
        bgStrong: 'rgba(79, 70, 229, 0.18)',
        border: 'rgba(79, 70, 229, 0.55)',
        borderStrong: 'rgba(67, 56, 202, 0.75)',
        text: '#4f46e5',
        textStrong: '#4338ca',
      },
      // Кнопки
      button: {
        primaryBg: '#6366f1',
        primaryBgHover: '#4f46e5',
        primaryBgActive: '#4338ca',
        primaryBorder: '#6366f1',
        primaryText: '#ffffff',
        secondaryBg: 'rgba(148, 163, 184, 0.12)',
        secondaryBgHover: 'rgba(148, 163, 184, 0.22)',
        secondaryBorder: 'rgba(148, 163, 184, 0.38)',
        secondaryText: '#1e293b',
        ghostBg: 'transparent',
        ghostBgHover: 'rgba(99, 102, 241, 0.08)',
        ghostText: '#4f46e5',
        dangerBg: '#ef4444',
        dangerBgHover: '#dc2626',
        dangerBgActive: '#b91c1c',
        dangerBorder: '#fca5a5',
        dangerText: '#ffffff',
      },
      // Интерактивные элементы
      interactive: {
        bg: 'rgba(148, 163, 184, 0.18)',
        bgHover: 'rgba(148, 163, 184, 0.28)',
        bgActive: 'rgba(148, 163, 184, 0.38)',
        border: 'rgba(148, 163, 184, 0.38)',
        borderHover: 'rgba(79, 70, 229, 0.6)',
        text: '#1e293b',
      },
      // Статусы
      status: {
        successBg: 'rgba(34, 197, 94, 0.12)',
        successBorder: 'rgba(34, 197, 94, 0.45)',
        successText: '#15803d',
        warningBg: 'rgba(251, 191, 36, 0.12)',
        warningBorder: 'rgba(251, 191, 36, 0.45)',
        warningText: '#b45309',
        errorBg: 'rgba(239, 68, 68, 0.12)',
        errorBorder: 'rgba(239, 68, 68, 0.45)',
        errorText: '#b91c1c',
        infoBg: 'rgba(59, 130, 246, 0.12)',
        infoBorder: 'rgba(59, 130, 246, 0.45)',
        infoText: '#1d4ed8',
      },
      // Spacing (общие для всех тем)
      contentInlinePadding: '20px',
      railCollapsedWidth: '56px',
      railDockSpacing: '1rem',
      railSafeGap: '5px',
      railSafeArea: 'calc(56px + 1rem + 5px)',
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'dark';

// Утилиты для работы с токенами
export function getResolvedTokens(theme: ThemeName): ThemeTokens {
  return designTokens.themes[theme];
}

// Применение токенов к DOM
export function applyThemeTokens(theme: ThemeName) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const tokens = getResolvedTokens(theme);

  // Применяем токены как CSS-переменные
  const flatTokens = flattenTokens(tokens);
  for (const [token, value] of Object.entries(flatTokens)) {
    root.style.setProperty(`--${token}`, value);
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
}

// Преобразование вложенной структуры токенов в плоскую для CSS-переменных
function flattenTokens(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const tokenName = prefix ? `${prefix}-${camelToKebab(key)}` : camelToKebab(key);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, tokenName));
    } else {
      result[tokenName] = String(value);
    }
  }

  return result;
}

// Преобразование camelCase в kebab-case
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Получение ссылки на CSS-переменную
export function getCssVar(path: string): string {
  return `var(--${path})`;
}

// Генерация Tailwind токенов из дизайн-токенов
export function getTailwindTokens(): Record<string, string> {
  const tokens = flattenTokens(designTokens.themes.dark);
  return Object.fromEntries(Object.keys(tokens).map((token) => [token, getCssVar(token)]));
}
