import { DEFAULT_THEME, designTokens } from '@/design-tokens';

// Сериализация токенов для встраивания в скрипт
const serializedTokens = JSON.stringify(designTokens);

// Функция для преобразования camelCase в kebab-case (дублируем для скрипта)
const camelToKebabCode = `
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
`;

// Функция для сплющивания вложенных объектов в плоские токены
const flattenTokensCode = `
function flattenTokens(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const tokenName = prefix ? prefix + '-' + camelToKebab(key) : camelToKebab(key);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, tokenName));
    } else {
      result[tokenName] = String(value);
    }
  }
  return result;
}
`;

const SCRIPT_CONTENT = `(() => {
  ${camelToKebabCode}
  ${flattenTokensCode}
  
  const TOKENS = ${serializedTokens};
  const DEFAULT_THEME = '${DEFAULT_THEME}';

  const applyTokens = (theme) => {
    const root = document.documentElement;
    const themeTokens = TOKENS.themes[theme];
    const flatTokens = flattenTokens(themeTokens);
    
    for (const [key, value] of Object.entries(flatTokens)) {
      root.style.setProperty('--' + key, value);
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
