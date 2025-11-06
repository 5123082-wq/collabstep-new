# Календарь и временная шкала для задач

## Обзор

Добавлены два новых представления для отображения задач проекта:

1. **CalendarView** - календарное представление с использованием `react-big-calendar`
2. **TimelineView** - диаграмма Ганта (временная шкала) для визуализации задач

## Компоненты

### CalendarView

**Расположение:** `apps/web/components/project/views/CalendarView.tsx`

**Функциональность:**
- Отображение задач в календарном формате (месяц/неделя/день/повестка)
- Цветовая кодировка по статусам задач
- Drag-and-drop для изменения дат задач
- Resize событий для изменения длительности
- Русская локализация
- Клик по задаче для открытия деталей

**Использование:**
```tsx
<CalendarView
  tasks={tasks}
  projectKey="PROJ"
  onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
  onEventDrop={(taskId, newStart, newEnd) => {
    // Обновить даты задачи
  }}
  isLoading={false}
/>
```

### TimelineView (Gantt)

**Расположение:** `apps/web/components/project/views/TimelineView.tsx`

**Функциональность:**
- Диаграмма Ганта для визуализации задач на временной шкале
- Переключение масштаба (день/неделя/месяц)
- Навигация по временной шкале
- Отображение прогресса задач
- Цветовая кодировка по прогрессу выполнения
- Клик по задаче для открытия деталей

**Использование:**
```tsx
<TimelineView
  tasks={tasks}
  projectKey="PROJ"
  onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
  onTaskDateChange={(taskId, startDate, dueDate) => {
    // Обновить даты задачи
  }}
  isLoading={false}
/>
```

## Утилиты

### Calendar Utils

**Расположение:** `apps/web/lib/project/calendar-utils.ts`

Функции:
- `tasksToCalendarEvents(tasks: Task[]): CalendarEvent[]` - конвертация задач в события календаря
- `getTaskStatusColor(status: TaskStatus): string` - получение цвета для статуса
- `getTaskPriorityColor(priority: TaskPriority): string` - получение цвета для приоритета
- `formatTaskDisplayKey(projectKey: string, taskNumber: number): string` - форматирование ключа задачи

### Gantt Utils

**Расположение:** `apps/web/lib/project/gantt-utils.ts`

Функции:
- `tasksToGanttTasks(tasks: Task[], projectKey: string): GanttTask[]` - конвертация задач для Gantt
- `calculateGanttDateRange(tasks: Task[]): { startDate: Date; endDate: Date }` - расчет диапазона дат
- `formatGanttDate(date: Date, scale: 'day' | 'week' | 'month'): string` - форматирование дат
- `getDaysBetween(start: Date, end: Date): number` - расчет дней между датами

## Стили

Кастомные стили для react-big-calendar добавлены в `apps/web/styles/globals.css`:
- Поддержка темной и светлой темы
- Кастомизированная панель инструментов
- Стилизация событий
- Адаптивные цвета для обеих тем

## Интеграция

Компоненты интегрированы в `apps/web/app/(app)/project/[id]/tasks/project-tasks-page-client.tsx`:

```tsx
// Обработчики для изменения дат
const handleEventDrop = useCallback(
  async (taskId: string, newStart: Date, newEnd: Date) => {
    await handleTaskUpdate(taskId, {
      startDate: newStart.toISOString(),
      dueAt: newEnd.toISOString()
    });
  },
  [handleTaskUpdate]
);

const handleTaskDateChange = useCallback(
  async (taskId: string, startDate: Date, dueDate: Date) => {
    await handleTaskUpdate(taskId, {
      startDate: startDate.toISOString(),
      dueAt: dueDate.toISOString()
    });
  },
  [handleTaskUpdate]
);

// Использование в рендере
{view === 'calendar' ? (
  <CalendarView
    tasks={items}
    projectKey={projectKey}
    onTaskClick={handleTaskClick}
    onEventDrop={handleEventDrop}
    isLoading={isLoading}
  />
) : view === 'gantt' ? (
  <TimelineView
    tasks={items}
    projectKey={projectKey}
    onTaskClick={handleTaskClick}
    onTaskDateChange={handleTaskDateChange}
    isLoading={isLoading}
  />
) : null}
```

## Зависимости

Новые пакеты добавлены в `package.json`:
- `date-fns` (^4.1.0) - библиотека для работы с датами
- `react-big-calendar` (^1.19.4) - компонент календаря
- `@types/react-big-calendar` (^1.16.3) - типы для TypeScript

## Особенности реализации

### Типизация

`TaskItem` расширен для включения всех необходимых полей `Task`:
```typescript
type TaskItem = Pick<
  Task,
  | 'id'
  | 'number'
  | 'title'
  | 'status'
  // ... остальные поля
  | 'projectId'
  | 'parentId'
  | 'createdAt'
  | 'updatedAt'
>;
```

### Локализация

Оба компонента используют русскую локализацию через `date-fns/locale`:
```typescript
import { ru } from 'date-fns/locale';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ru }),
  getDay,
  locales: { 'ru-RU': ru }
});
```

### Цветовая схема

Задачи отображаются с цветами в зависимости от статуса:
- `new` - индиго (#6366f1)
- `in_progress` - голубой (#0ea5e9)
- `review` - янтарный (#f59e0b)
- `done` - изумрудный (#10b981)
- `blocked` - красный (#ef4444)

## Будущие улучшения

Потенциальные улучшения:
1. Добавление возможности создания задач через клик в календаре
2. Отображение зависимостей между задачами в TimelineView
3. Фильтрация задач по исполнителям и меткам
4. Экспорт календаря в iCal формат
5. Печать Gantt диаграммы
6. Поддержка рекуррентных задач

## Тестирование

Для тестирования:
1. Запустите dev сервер: `npm run dev`
2. Откройте проект с задачами
3. Переключитесь на вид "Календарь" или "Gantt"
4. Попробуйте:
   - Перетащить задачу на другую дату
   - Изменить длительность задачи
   - Кликнуть по задаче для просмотра деталей
   - Переключить масштаб (день/неделя/месяц)
   - Навигацию по датам

