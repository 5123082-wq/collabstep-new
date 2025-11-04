# Система тем оформления

## 📋 Обзор

Новая система тем представляет собой централизованную, масштабируемую архитектуру для управления цветами, стилями и визуальными вариантами в приложении.

## 🎯 Основные компоненты

### 1. Дизайн-токены (`design-tokens.ts`)

**Назначение**: Централизованное хранилище всех цветовых и пространственных токенов.

**Структура**:

```typescript
{
  themes: {
    dark: {...},  // Токены для темной темы
    light: {...}  // Токены для светлой темы
  }
}
```

**Категории токенов**:

- **Surface** - цвета фонов (canvas, base, elevated, muted, popover, overlay)
- **Border** - цвета границ (subtle, base, strong)
- **Text** - цвета текста (primary, secondary, tertiary, muted, inverse)
- **Accent** - акцентные цвета (bg, bgStrong, border, borderStrong, text, textStrong)
- **Button** - цвета кнопок (primary, secondary, ghost, danger)
- **Interactive** - интерактивные элементы (bg, bgHover, bgActive, border, borderHover)
- **Status** - статусные цвета (success, warning, error, info)
- **Spacing** - пространственные токены (padding, margins, gaps)

**Использование**:

```typescript
import { applyThemeTokens, getCssVar } from '@/design-tokens';

// Применить тему
applyThemeTokens('dark');

// Получить CSS-переменную
const color = getCssVar('surface-base');
```

### 2. Темы секций (`stores/sectionTheming.ts`)

**Назначение**: Управление визуальными вариантами для отдельных секций/компонентов.

**Варианты** (`SectionVariant`):

- `default` - базовый вид без дополнительного оформления
- `elevated` - приподнятая карточка с тенью
- `minimal` - минималистичный стиль
- `bordered` - с акцентной рамкой
- `glass` - стеклянный эффект (backdrop blur)

**Акцентные цвета** (`SectionAccentColor`):

- `indigo` (основной)
- `emerald` (успех)
- `amber` (предупреждение)
- `rose` (ошибка)
- `blue`
- `purple`
- `neutral`

**Уровни интенсивности** (`IntensityLevel`):

- `subtle` - ненавязчивый
- `base` - стандартный
- `strong` - выраженный

**Предустановки**:

```typescript
import { useSectionThemingStore, PRESET_THEMES } from '@/stores/sectionTheming';

// Применить предустановку
const { applyPreset } = useSectionThemingStore();
applyPreset('my-section', 'card'); // elevated + indigo + base
applyPreset('success-section', 'success'); // bordered + emerald + base
applyPreset('minimal-section', 'minimal'); // minimal + neutral + subtle
```

**Кастомная тема**:

```typescript
const { setSectionTheme } = useSectionThemingStore();
setSectionTheme('my-section', {
  variant: 'bordered',
  accentColor: 'purple',
  intensity: 'strong',
  customClassName: 'my-custom-class',
});
```

### 3. Утилиты для секций (`lib/theming/section-theme-utils.ts`)

**Функции**:

```typescript
// Генерация CSS-классов
const className = generateSectionClassName(theme);
// Результат: "cs-section cs-section--elevated cs-section--indigo cs-section--base"

// Генерация inline-стилей
const styles = getSectionThemeStyles(theme);

// Генерация Tailwind-классов
const tailwindClasses = getSectionTailwindClasses(theme);

// Получение цветовой схемы
const colorScheme = getAccentColorScheme('indigo');
// { bg, bgHover, border, borderHover, text, textStrong }
```

### 4. CSS-стили (`styles/`)

**section-themes.css** - стили для вариантов секций:

```css
.cs-section--elevated {
  /* приподнятая карточка */
}
.cs-section--minimal {
  /* минималистичный */
}
.cs-section--bordered {
  /* с рамкой */
}
.cs-section--glass {
  /* стеклянный эффект */
}
```

**globals.css** - глобальные стили и переопределения Tailwind:

- Базовая типографика
- Фоновые эффекты (mesh, grid, halo, sunrise, mint, lavender, sands)
- Layout утилиты
- Tailwind переопределения через @layer components

### 5. Тема-контекст (`components/theme/`)

**ThemeProvider** - React-контекст для управления темой:

```tsx
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { mode, resolvedTheme, setMode, cycleMode } = useTheme();
  return <button onClick={cycleMode}>Toggle Theme</button>;
}
```

**ThemeScript** - скрипт для предотвращения flash при загрузке:

```tsx
import ThemeScript from '@/components/theme/ThemeScript';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 🚀 Использование

### Пример 1: Применение темы к секции

```tsx
import { useSectionThemingStore } from '@/stores/sectionTheming';
import {
  generateSectionClassName,
  getSectionThemeStyles,
} from '@/lib/theming/section-theme-utils';

function MySection() {
  const theme = useSectionThemingStore((state) =>
    state.getSectionTheme('my-section')
  );

  const className = generateSectionClassName(theme);
  const styles = getSectionThemeStyles(theme);

  return (
    <section className={className} style={styles}>
      <h2>My Section</h2>
    </section>
  );
}
```

### Пример 2: Использование CSS-переменных

```tsx
// В компоненте
<div style={{
  backgroundColor: 'var(--surface-elevated)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-base)'
}}>
  Content
</div>

// В CSS/Tailwind
.my-card {
  background-color: var(--surface-base);
  border: 1px solid var(--border-subtle);
}
```

### Пример 3: Использование Tailwind с токенами

```tsx
<div className="bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--border-base)]">
  Content
</div>
```

## 🎨 Миграция со старой системы

### До (старая система):

```tsx
// Хардкоженные значения
<section className="bg-neutral-950/60 border-neutral-900">
  ...
</section>

// Использование !important в CSS
.section {
  background-color: rgba(10, 10, 10, 0.4) !important;
}
```

### После (новая система):

```tsx
// Использование токенов
<section className="cs-section cs-section--elevated">
  ...
</section>

// CSS с переменными
.section {
  background-color: var(--surface-base);
}
```

## 📊 Преимущества новой системы

1. **Централизация** - все токены в одном месте
2. **Консистентность** - единообразие во всем приложении
3. **Гибкость** - легко изменить всю цветовую схему
4. **Типобезопасность** - TypeScript для всех токенов
5. **Масштабируемость** - легко добавлять новые темы и варианты
6. **Производительность** - CSS-переменные вместо множества переопределений
7. **DX (Developer Experience)** - понятные имена и структура
8. **Поддержка светлой темы** - автоматическая адаптация всех компонентов

## 🔧 Конфигурация

### Добавление новой темы секции

1. Добавить предустановку в `PRESET_THEMES`:

```typescript
export const PRESET_THEMES = {
  // ...
  myCustom: {
    variant: 'glass',
    accentColor: 'purple',
    intensity: 'strong',
  },
};
```

2. Применить:

```typescript
applyPreset('section-id', 'myCustom');
```

### Добавление нового цветового токена

1. Обновить типы в `design-tokens.ts`:

```typescript
type SemanticTokens = {
  // ...
  myNewCategory: {
    bg: string;
    text: string;
  };
};
```

2. Добавить значения:

```typescript
export const designTokens = {
  themes: {
    dark: {
      // ...
      myNewCategory: {
        bg: '#...',
        text: '#...',
      },
    },
    light: {
      /* ... */
    },
  },
};
```

3. Использовать:

```typescript
const color = getCssVar('my-new-category-bg');
```

## 📝 Best Practices

1. **Всегда используйте токены** вместо хардкоженных цветов
2. **Предпочитайте CSS-классы** вместо inline-стилей
3. **Используйте предустановки** для типовых случаев
4. **Создавайте кастомные темы** только для специфичных кейсов
5. **Тестируйте в обеих темах** (dark/light)
6. **Избегайте !important** - используйте CSS-слои (@layer)
7. **Документируйте кастомные темы** если создаете новые

## 🐛 Отладка

### Проверка применения темы

```javascript
// В консоли браузера
console.log(document.documentElement.dataset.theme); // 'dark' или 'light'
console.log(
  getComputedStyle(document.documentElement).getPropertyValue('--surface-base')
);
```

### Проверка темы секции

```javascript
// В консоли браузера
import { useSectionThemingStore } from '@/stores/sectionTheming';
console.log(useSectionThemingStore.getState().sectionThemes);
```

## 📚 Дополнительные ресурсы

- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
