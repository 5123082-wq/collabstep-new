# Шпаргалка: Система тем

## 🎨 CSS-переменные (Токены)

### Фоны

```css
var(--surface-canvas)    /* Фон страницы */
var(--surface-base)      /* Базовый фон */
var(--surface-elevated)  /* Приподнятый элемент */
var(--surface-muted)     /* Приглушенный фон */
var(--surface-popover)   /* Всплывающее окно */
var(--surface-overlay)   /* Оверлей/затемнение */
```

### Границы

```css
var(--border-subtle)     /* Ненавязчивая */
var(--border-base)       /* Стандартная */
var(--border-strong)     /* Выраженная */
```

### Текст

```css
var(--text-primary)      /* Основной текст */
var(--text-secondary)    /* Вторичный */
var(--text-tertiary)     /* Третичный */
var(--text-muted)        /* Приглушенный */
var(--text-inverse)      /* Инверсный */
```

### Акценты

```css
var(--accent-bg)              /* Фон */
var(--accent-bg-strong)       /* Усиленный фон */
var(--accent-border)          /* Граница */
var(--accent-border-strong)   /* Усиленная граница */
var(--accent-text)            /* Текст */
var(--accent-text-strong)     /* Усиленный текст */
```

### Кнопки

```css
/* Primary */
var(--button-primary-bg)
var(--button-primary-bg-hover)
var(--button-primary-bg-active)
var(--button-primary-border)
var(--button-primary-text)

/* Secondary */
var(--button-secondary-bg)
var(--button-secondary-bg-hover)
var(--button-secondary-border)
var(--button-secondary-text)

/* Ghost */
var(--button-ghost-bg)
var(--button-ghost-bg-hover)
var(--button-ghost-text)

/* Danger */
var(--button-danger-bg)
var(--button-danger-bg-hover)
var(--button-danger-bg-active)
var(--button-danger-border)
var(--button-danger-text)
```

### Статусы

```css
/* Success */
var(--status-success-bg)
var(--status-success-border)
var(--status-success-text)

/* Warning */
var(--status-warning-bg)
var(--status-warning-border)
var(--status-warning-text)

/* Error */
var(--status-error-bg)
var(--status-error-border)
var(--status-error-text)

/* Info */
var(--status-info-bg)
var(--status-info-border)
var(--status-info-text)
```

## 🎯 Классы секций

### Базовая структура

```html
<section
  class="cs-section cs-section--{variant} cs-section--{color} cs-section--{intensity}"
></section>
```

### Варианты

```html
cs-section--default
<!-- Без оформления -->
cs-section--elevated
<!-- Приподнятая карточка -->
cs-section--minimal
<!-- Минималистичный -->
cs-section--bordered
<!-- С рамкой -->
cs-section--glass
<!-- Стеклянный эффект -->
```

### Цвета

```html
cs-section--indigo
<!-- Синий (по умолчанию) -->
cs-section--emerald
<!-- Зеленый -->
cs-section--amber
<!-- Желтый -->
cs-section--rose
<!-- Красный -->
cs-section--blue
<!-- Голубой -->
cs-section--purple
<!-- Фиолетовый -->
cs-section--neutral
<!-- Нейтральный -->
```

### Интенсивность

```html
cs-section--subtle
<!-- Ненавязчивый -->
cs-section--base
<!-- Стандартный -->
cs-section--strong
<!-- Выраженный -->
```

## 💻 TypeScript API

### Глобальная тема

```typescript
import { useTheme } from '@/components/theme/ThemeContext';

const { mode, resolvedTheme, setMode, cycleMode } = useTheme();

// Режимы: 'light' | 'dark' | 'system'
setMode('dark');
cycleMode(); // system → light → dark → system
```

### Темы секций

```typescript
import { useSectionThemingStore } from '@/stores/sectionTheming';

const {
  sectionThemes, // Все темы
  setSectionTheme, // Установить тему
  getSectionTheme, // Получить тему
  applyPreset, // Применить предустановку
  resetSectionTheme, // Сбросить тему
  resetAll, // Сбросить все
} = useSectionThemingStore();
```

### Предустановки

```typescript
applyPreset('section-id', 'default'); // Стандартный
applyPreset('section-id', 'card'); // Карточка
applyPreset('section-id', 'minimal'); // Минималистичный
applyPreset('section-id', 'accent'); // Акцентный
applyPreset('section-id', 'success'); // Успех (зеленый)
applyPreset('section-id', 'warning'); // Предупреждение (желтый)
applyPreset('section-id', 'danger'); // Ошибка (красный)
applyPreset('section-id', 'glass'); // Стеклянный
```

### Кастомная тема

```typescript
setSectionTheme('section-id', {
  variant: 'bordered',
  accentColor: 'purple',
  intensity: 'strong',
  customClassName: 'my-custom-class',
});
```

### Утилиты

```typescript
import {
  generateSectionClassName,
  getSectionThemeStyles,
  getSectionTailwindClasses,
  getAccentColorScheme,
} from '@/lib/theming/section-theme-utils';

const className = generateSectionClassName(theme);
const styles = getSectionThemeStyles(theme);
const tailwind = getSectionTailwindClasses(theme);
const colors = getAccentColorScheme('indigo');
```

## 🎨 Примеры использования

### Карточка

```tsx
<div className="cs-section cs-section--elevated cs-section--base">
  <h3>Заголовок</h3>
  <p>Содержимое</p>
</div>
```

### Сообщение об успехе

```tsx
<div className="cs-section cs-section--bordered cs-section--emerald cs-section--base">
  <p className="text-[var(--status-success-text)]">Успешно!</p>
</div>
```

### Предупреждение

```tsx
<div className="cs-section cs-section--bordered cs-section--amber cs-section--base">
  <p className="text-[var(--status-warning-text)]">Внимание!</p>
</div>
```

### Ошибка

```tsx
<div className="cs-section cs-section--bordered cs-section--rose cs-section--base">
  <p className="text-[var(--status-error-text)]">Ошибка!</p>
</div>
```

### Кнопка Primary

```tsx
<button
  className="px-4 py-2 rounded-lg transition"
  style={{
    backgroundColor: 'var(--button-primary-bg)',
    color: 'var(--button-primary-text)',
  }}
>
  Нажми меня
</button>
```

### Кнопка Secondary

```tsx
<button className="bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] border border-[var(--button-secondary-border)] hover:bg-[var(--button-secondary-bg-hover)] px-4 py-2 rounded-lg transition">
  Вторичная
</button>
```

### Модальное окно

```tsx
<div className="fixed inset-0 bg-[var(--surface-overlay)]">
  <div className="cs-section cs-section--elevated max-w-md mx-auto mt-20">
    <h2 className="text-[var(--text-primary)]">Модальное окно</h2>
    <p className="text-[var(--text-secondary)]">Содержимое</p>
  </div>
</div>
```

### Стеклянная карточка

```tsx
<div className="cs-section cs-section--glass cs-section--indigo cs-section--subtle">
  <h3 className="text-[var(--text-primary)]">Стеклянный эффект</h3>
  <p className="text-[var(--text-secondary)]">С размытием фона</p>
</div>
```

### Динамическая тема

```tsx
function DynamicSection({ sectionId }) {
  const theme = useSectionThemingStore((s) => s.getSectionTheme(sectionId));
  const className = generateSectionClassName(theme);
  const styles = getSectionThemeStyles(theme);

  return (
    <section className={className} style={styles}>
      Содержимое
    </section>
  );
}
```

## 🔄 Миграция

### Было → Стало

#### Фоны

```tsx
// ❌ Было
className = 'bg-neutral-950/60';

// ✅ Стало
className = 'bg-[var(--surface-base)]';
```

#### Текст

```tsx
// ❌ Было
className = 'text-neutral-100';

// ✅ Стало
className = 'text-[var(--text-primary)]';
```

#### Границы

```tsx
// ❌ Было
className = 'border-neutral-800';

// ✅ Стало
className = 'border-[var(--border-base)]';
```

#### Секция

```tsx
// ❌ Было
className = 'rounded-2xl border border-neutral-900 bg-neutral-950/80 p-6';

// ✅ Стало
className = 'cs-section cs-section--elevated';
```

## 🎯 Быстрые команды

### Проверка темы в консоли

```javascript
// Текущая тема
document.documentElement.dataset.theme;

// Значение токена
getComputedStyle(document.documentElement).getPropertyValue('--surface-base');

// Все темы секций
useSectionThemingStore.getState().sectionThemes;
```

### Применить тему

```typescript
// Глобальная
applyThemeTokens('dark');

// Секция
applyPreset('my-section', 'card');

// Кастомная
setSectionTheme('my-section', {
  variant: 'glass',
  accentColor: 'purple',
  intensity: 'strong',
});
```

### Сброс

```typescript
// Одна секция
resetSectionTheme('section-id');

// Все секции
resetAll();
```

## 📦 Импорты

```typescript
// Контекст темы
import { useTheme, ThemeProvider } from '@/components/theme/ThemeContext';
import ThemeScript from '@/components/theme/ThemeScript';

// Токены
import { applyThemeTokens, getCssVar, designTokens } from '@/design-tokens';

// Темы секций
import {
  useSectionThemingStore,
  PRESET_THEMES,
  type SectionTheme,
} from '@/stores/sectionTheming';

// Утилиты
import {
  generateSectionClassName,
  getSectionThemeStyles,
  getSectionTailwindClasses,
  getAccentColorScheme,
} from '@/lib/theming/section-theme-utils';
```

## 🎨 Готовые паттерны

### Карточка товара

```tsx
<article className="cs-section cs-section--elevated">
  <img src="..." className="rounded-lg" />
  <h3 className="text-[var(--text-primary)]">Название</h3>
  <p className="text-[var(--text-secondary)]">Описание</p>
  <span className="text-[var(--accent-text-strong)]">$99</span>
</article>
```

### Форма

```tsx
<form className="cs-section cs-section--minimal space-y-4">
  <input className="bg-[var(--surface-base)] border-[var(--border-base)] text-[var(--text-primary)]" />
  <button className="bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]">
    Отправить
  </button>
</form>
```

### Алерт

```tsx
<div className="cs-section cs-section--bordered cs-section--rose cs-section--base">
  <div className="flex items-center gap-2">
    <Icon className="text-[var(--status-error-text)]" />
    <p className="text-[var(--status-error-text)]">Что-то пошло не так</p>
  </div>
</div>
```

---

**💡 Совет:** Сохраните эту шпаргалку для быстрого доступа к токенам и API!
