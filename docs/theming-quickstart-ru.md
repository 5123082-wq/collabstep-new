# Быстрый старт: Система тем оформления

## 🎨 Что изменилось?

### Было (старая система)

❌ Хардкоженные цвета: `bg-neutral-950/60`  
❌ Множество `!important` в CSS  
❌ 643 строки переопределений в `globals.css`  
❌ Две несвязанные системы тем  
❌ Сложно менять цветовую схему

### Стало (новая система)

✅ CSS-переменные: `var(--surface-base)`  
✅ Централизованные токены в `design-tokens.ts`  
✅ Чистый, понятный CSS  
✅ Единая интегрированная система  
✅ Легко менять темы одной строкой

## 🚀 Основы

### 1. Глобальная тема (Dark/Light)

**Переключение темы:**

```tsx
import { useTheme } from '@/components/theme/ThemeContext';

function ThemeToggle() {
  const { cycleMode } = useTheme();
  return <button onClick={cycleMode}>Переключить тему</button>;
}
```

**Доступные режимы:**

- `dark` - темная тема
- `light` - светлая тема
- `system` - следовать системным настройкам

### 2. Темы секций

**Быстрое применение предустановки:**

```tsx
import { useSectionThemingStore } from '@/stores/sectionTheming';

function MyComponent() {
  const { applyPreset } = useSectionThemingStore();

  // Применить стиль "карточка"
  applyPreset('my-section', 'card');

  // Применить стиль "успех"
  applyPreset('success-message', 'success');

  // Применить минималистичный стиль
  applyPreset('sidebar', 'minimal');
}
```

**Доступные предустановки:**

- `default` - стандартный вид
- `card` - приподнятая карточка
- `minimal` - минималистичный
- `accent` - с акцентной рамкой
- `success` - зеленый (для успешных действий)
- `warning` - желтый (для предупреждений)
- `danger` - красный (для ошибок)
- `glass` - стеклянный эффект

### 3. Использование CSS-переменных

**В компонентах:**

```tsx
<div className="bg-[var(--surface-elevated)] text-[var(--text-primary)]">
  Контент
</div>
```

**В CSS:**

```css
.my-component {
  background-color: var(--surface-base);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
}
```

## 📋 Доступные токены

### Фоны (Surface)

- `--surface-canvas` - фон всей страницы
- `--surface-base` - базовый фон компонента
- `--surface-elevated` - приподнятый элемент
- `--surface-muted` - приглушенный фон
- `--surface-popover` - всплывающие окна
- `--surface-overlay` - оверлеи

### Границы (Border)

- `--border-subtle` - ненавязчивая граница
- `--border-base` - стандартная граница
- `--border-strong` - выраженная граница

### Текст (Text)

- `--text-primary` - основной текст
- `--text-secondary` - вторичный текст
- `--text-tertiary` - третичный текст
- `--text-muted` - приглушенный текст
- `--text-inverse` - инверсный (белый на темном, темный на светлом)

### Акценты (Accent)

- `--accent-bg` - акцентный фон
- `--accent-bg-strong` - усиленный акцентный фон
- `--accent-border` - акцентная граница
- `--accent-border-strong` - усиленная акцентная граница
- `--accent-text` - акцентный текст
- `--accent-text-strong` - усиленный акцентный текст

### Кнопки (Button)

- `--button-primary-bg` / `--button-primary-bg-hover` / `--button-primary-bg-active`
- `--button-secondary-bg` / `--button-secondary-bg-hover`
- `--button-ghost-bg` / `--button-ghost-bg-hover`
- `--button-danger-bg` / `--button-danger-bg-hover` / `--button-danger-bg-active`

### Статусы (Status)

- `--status-success-bg` / `--status-success-border` / `--status-success-text`
- `--status-warning-bg` / `--status-warning-border` / `--status-warning-text`
- `--status-error-bg` / `--status-error-border` / `--status-error-text`
- `--status-info-bg` / `--status-info-border` / `--status-info-text`

## 💡 Примеры использования

### Пример 1: Карточка товара

```tsx
import {
  generateSectionClassName,
  getSectionThemeStyles,
} from '@/lib/theming/section-theme-utils';
import { useSectionThemingStore } from '@/stores/sectionTheming';

function ProductCard() {
  const theme = useSectionThemingStore((state) =>
    state.getSectionTheme('product-card')
  );

  return (
    <div
      className={generateSectionClassName(theme)}
      style={getSectionThemeStyles(theme)}
    >
      <h3>Название товара</h3>
      <p>Описание товара</p>
    </div>
  );
}

// При инициализации:
useSectionThemingStore.getState().applyPreset('product-card', 'card');
```

### Пример 2: Сообщение об успехе

```tsx
function SuccessMessage({ message }) {
  return (
    <div className="cs-section cs-section--bordered cs-section--emerald cs-section--base">
      <p className="text-[var(--status-success-text)]">{message}</p>
    </div>
  );
}
```

### Пример 3: Кнопка с токенами

```tsx
function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: 'var(--button-primary-bg)',
        color: 'var(--button-primary-text)',
        border: '1px solid var(--button-primary-border)',
      }}
      className="px-4 py-2 rounded-lg hover:bg-[var(--button-primary-bg-hover)] transition"
    >
      {children}
    </button>
  );
}
```

### Пример 4: Кастомная тема секции

```tsx
import { useSectionThemingStore } from '@/stores/sectionTheming';

// Создать кастомную тему
function setupCustomTheme() {
  const { setSectionTheme } = useSectionThemingStore.getState();

  setSectionTheme('special-section', {
    variant: 'glass', // стеклянный эффект
    accentColor: 'purple', // фиолетовый акцент
    intensity: 'strong', // сильная интенсивность
  });
}
```

## 🎯 Варианты секций

### Default

```tsx
<section className="cs-section cs-section--default">
  Без дополнительного оформления
</section>
```

### Elevated (приподнятая карточка)

```tsx
<section className="cs-section cs-section--elevated">Карточка с тенью</section>
```

### Minimal (минималистичный)

```tsx
<section className="cs-section cs-section--minimal">
  Простой стиль с тонкой рамкой
</section>
```

### Bordered (с акцентной рамкой)

```tsx
<section className="cs-section cs-section--bordered cs-section--indigo">
  С цветной рамкой
</section>
```

### Glass (стеклянный эффект)

```tsx
<section className="cs-section cs-section--glass">Эффект размытия фона</section>
```

## 🔄 Миграция существующего кода

### Шаг 1: Заменить хардкоженные цвета

**Было:**

```tsx
<div className="bg-neutral-950/60 border-neutral-900 text-neutral-100">
```

**Стало:**

```tsx
<div className="bg-[var(--surface-base)] border-[var(--border-base)] text-[var(--text-primary)]">
```

### Шаг 2: Использовать CSS-классы секций

**Было:**

```tsx
<section className="rounded-2xl border border-neutral-900 bg-neutral-950/80 p-6">
```

**Стало:**

```tsx
<section className="cs-section cs-section--elevated">
```

### Шаг 3: Убрать !important из CSS

**Было:**

```css
.my-section {
  background-color: rgba(10, 10, 10, 0.4) !important;
}
```

**Стало:**

```css
.my-section {
  background-color: var(--surface-muted);
}
```

## ⚡ Полезные команды

```typescript
// Получить текущую тему
const { mode, resolvedTheme } = useTheme();

// Получить все темы секций
const allThemes = useSectionThemingStore.getState().sectionThemes;

// Сбросить тему секции
useSectionThemingStore.getState().resetSectionTheme('section-id');

// Сбросить все темы секций
useSectionThemingStore.getState().resetAll();
```

## 🎨 Цветовые схемы акцентов

```typescript
// Indigo (синий) - по умолчанию
cs-section--indigo

// Emerald (зеленый) - успех
cs-section--emerald

// Amber (желтый) - предупреждение
cs-section--amber

// Rose (красный) - ошибка
cs-section--rose

// Blue (голубой)
cs-section--blue

// Purple (фиолетовый)
cs-section--purple

// Neutral (нейтральный)
cs-section--neutral
```

## 📱 Адаптация к светлой теме

Все токены автоматически адаптируются при переключении темы. Не нужно писать дополнительный код!

```tsx
// Этот код работает одинаково в обеих темах
<div className="bg-[var(--surface-base)] text-[var(--text-primary)]">
  Автоматическая адаптация к теме
</div>
```

## 🐛 Частые проблемы

**Проблема:** Тема секции не применяется  
**Решение:** Убедитесь что вызвали `applyPreset` или `setSectionTheme` перед рендером

**Проблема:** Цвета не меняются при переключении темы  
**Решение:** Используйте CSS-переменные вместо хардкоженных значений

**Проблема:** Классы Tailwind перекрывают токены  
**Решение:** Используйте `bg-[var(--token)]` вместо обычных Tailwind классов

## 📚 Дополнительно

- [Полная документация](./theming-system.md)
- [Список всех токенов](../apps/web/design-tokens.ts)
- [Примеры компонентов](../apps/web/components/app/)
