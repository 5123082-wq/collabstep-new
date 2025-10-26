import { DEFAULT_THEME, designTokens } from '@/design-tokens';

const serializedTokens = JSON.stringify(designTokens);
const SCRIPT_CONTENT = `(() => {
  const TOKENS = ${serializedTokens};
  const DEFAULT_THEME = '${DEFAULT_THEME}';

  const applyTokens = (theme) => {
    const root = document.documentElement;
    const themeTokens = { ...TOKENS.shared, ...TOKENS.themes[theme] };
    for (const key in themeTokens) {
      root.style.setProperty('--' + key, themeTokens[key]);
    }
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  };

  try {
    const storageKey = 'cv-theme-mode';
    const stored = window.localStorage.getItem(storageKey);
    const mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    applyTokens(resolved);
  } catch (error) {
    applyTokens(DEFAULT_THEME);
  }
})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT_CONTENT }} />;
}
