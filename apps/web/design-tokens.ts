export type ThemeName = 'dark' | 'light';

type TokenRecord = Record<string, string>;

type DesignTokens = {
  shared: TokenRecord;
  themes: Record<ThemeName, TokenRecord>;
};

export const designTokens: DesignTokens = {
  shared: {
    'content-inline-padding': '24px',
    'rail-collapsed-width': '56px',
    'rail-dock-spacing': '1rem',
    'rail-safe-gap': '5px',
    'rail-safe-area': 'calc(var(--rail-collapsed-width) + var(--rail-dock-spacing) + var(--rail-safe-gap))'
  },
  themes: {
    dark: {
      'surface-canvas': '#040712',
      'surface-base': 'rgba(9, 13, 23, 0.92)',
      'surface-muted': 'rgba(12, 18, 30, 0.85)',
      'surface-popover': 'rgba(11, 16, 27, 0.96)',
      'surface-overlay': 'rgba(4, 7, 18, 0.68)',
      'surface-border-subtle': 'rgba(148, 163, 184, 0.24)',
      'surface-border-strong': 'rgba(165, 180, 203, 0.36)',
      'surface-chip': '#0f172a',
      'text-primary': '#f8fafc',
      'text-secondary': '#cbd5f5',
      'text-tertiary': '#94a3b8',
      'text-chip': '#e2e8f0',
      'accent-border': 'rgba(129, 140, 248, 0.55)',
      'accent-border-strong': 'rgba(99, 102, 241, 0.75)',
      'accent-bg': 'rgba(99, 102, 241, 0.16)',
      'accent-bg-strong': 'rgba(99, 102, 241, 0.22)',
      'accent-foreground': '#ffffff',
      'button-primary-bg': '#6366f1',
      'button-primary-bg-hover': '#4f46e5',
      'button-primary-bg-active': '#4338ca',
      'button-primary-border': '#4f46e5',
      'button-primary-border-strong': '#4338ca',
      'button-primary-foreground': '#ffffff',
      'button-danger-bg': '#ef4444',
      'button-danger-bg-hover': '#dc2626',
      'button-danger-bg-active': '#b91c1c',
      'button-danger-border': '#f87171',
      'button-danger-border-strong': '#b91c1c',
      'button-danger-foreground': '#ffffff',
      'button-ghost-foreground': '#cbd5f5',
      'button-trendy-bg': '#474973',
      'button-trendy-bg-hover': '#3b3d61',
      'button-trendy-bg-active': '#2f304f',
      'button-trendy-border': '#6c6da4',
      'button-trendy-border-strong': '#9a9ccd',
      'button-trendy-foreground': '#ffffff',
      'theme-control-bg': 'rgba(15, 23, 42, 0.72)',
      'theme-control-border': 'rgba(99, 102, 241, 0.42)',
      'theme-control-border-hover': 'rgba(129, 140, 248, 0.75)',
      'theme-control-foreground': '#cbd5ff',
      'theme-control-foreground-hover': '#e2e8ff'
    },
    light: {
      'surface-canvas': '#f4f6fb',
      'surface-base': 'rgba(255, 255, 255, 0.96)',
      'surface-muted': 'rgba(241, 245, 249, 0.92)',
      'surface-popover': 'rgba(255, 255, 255, 0.98)',
      'surface-overlay': 'rgba(15, 23, 42, 0.45)',
      'surface-border-subtle': 'rgba(148, 163, 184, 0.35)',
      'surface-border-strong': 'rgba(100, 116, 139, 0.45)',
      'surface-chip': 'rgba(15, 23, 42, 0.08)',
      'text-primary': '#0f172a',
      'text-secondary': '#1f2937',
      'text-tertiary': '#334155',
      'text-chip': '#0f172a',
      'accent-border': 'rgba(79, 70, 229, 0.55)',
      'accent-border-strong': 'rgba(67, 56, 202, 0.75)',
      'accent-bg': 'rgba(99, 102, 241, 0.16)',
      'accent-bg-strong': 'rgba(79, 70, 229, 0.18)',
      'accent-foreground': '#ffffff',
      'button-primary-bg': '#6366f1',
      'button-primary-bg-hover': '#4f46e5',
      'button-primary-bg-active': '#4338ca',
      'button-primary-border': '#6366f1',
      'button-primary-border-strong': '#4f46e5',
      'button-primary-foreground': '#ffffff',
      'button-danger-bg': '#ef4444',
      'button-danger-bg-hover': '#dc2626',
      'button-danger-bg-active': '#b91c1c',
      'button-danger-border': '#fca5a5',
      'button-danger-border-strong': '#dc2626',
      'button-danger-foreground': '#ffffff',
      'button-ghost-foreground': '#6366f1',
      'button-trendy-bg': '#474973',
      'button-trendy-bg-hover': '#3b3d61',
      'button-trendy-bg-active': '#2f304f',
      'button-trendy-border': '#6c6da4',
      'button-trendy-border-strong': '#9a9ccd',
      'button-trendy-foreground': '#ffffff',
      'theme-control-bg': 'rgba(148, 163, 184, 0.18)',
      'theme-control-border': 'rgba(148, 163, 184, 0.38)',
      'theme-control-border-hover': 'rgba(79, 70, 229, 0.6)',
      'theme-control-foreground': '#1e293b',
      'theme-control-foreground-hover': '#312e81'
    }
  }
};

export const DEFAULT_THEME: ThemeName = 'dark';

export function getResolvedTokens(theme: ThemeName): TokenRecord {
  return { ...designTokens.shared, ...designTokens.themes[theme] };
}

export function applyThemeTokens(theme: ThemeName) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const tokens = getResolvedTokens(theme);
  for (const [token, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${token}`, value);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
}

export function getCssVarReference(token: string) {
  return `var(--${token})`;
}

export function getTailwindColorTokens(): Record<string, string> {
  const themeTokens = designTokens.themes.dark;
  return Object.fromEntries(Object.keys(themeTokens).map((token) => [token, getCssVarReference(token)]));
}

export function getTailwindSpacingTokens(): Record<string, string> {
  const spacingTokens: Record<string, string> = {
    'content-inline': getCssVarReference('content-inline-padding'),
    'rail-collapsed': getCssVarReference('rail-collapsed-width'),
    'rail-dock-spacing': getCssVarReference('rail-dock-spacing'),
    'rail-safe-gap': getCssVarReference('rail-safe-gap'),
    'rail-safe-area': getCssVarReference('rail-safe-area')
  };
  return spacingTokens;
}
