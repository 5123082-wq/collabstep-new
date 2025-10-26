# Button

## Описание
Компонент `Button` реализует базовую кнопку с единым стилем для всего интерфейса. Он использует дизайн‑токены (`--accent-bg`, `--accent-border`, `--text-primary`) для управления цветами фона, текста и границ, а также тени с мягким смещением для визуальной иерархии.

## Состояния
- **Hover** — усиливает цвет границы (`--accent-border-strong`) и приподнимает кнопку с лёгкой тенью.
- **Active** — убирает смещение, сохраняет насыщенный фон (`--accent-bg-strong`) и возвращает базовую тень.
- **Disabled** — снижает прозрачность и отключает интерактивность.
- **Loading** — блокирует кнопку и показывает индикатор спиннера поверх текста.

## Пример использования
```tsx
import { Button } from '@/components/ui/button';

export function Actions() {
  return (
    <div className="flex gap-3">
      <Button>Создать проект</Button>
      <Button variant="secondary">Черновик</Button>
      <Button variant="ghost">Отмена</Button>
    </div>
  );
}
```
