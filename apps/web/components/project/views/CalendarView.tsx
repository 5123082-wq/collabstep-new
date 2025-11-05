'use client';

import { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task } from '@/domain/projects/types';
import { tasksToCalendarEvents, getTaskStatusColor } from '@/lib/project/calendar-utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';

const locales = {
  'ru-RU': ru
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ru }),
  getDay,
  locales
});

type CalendarViewProps = {
  tasks: Task[];
  projectKey: string;
  onTaskClick?: (taskId: string) => void;
  onEventDrop?: (taskId: string, newStart: Date, newEnd: Date) => void;
  isLoading?: boolean;
};

export function CalendarView({ tasks, projectKey, onTaskClick, onEventDrop, isLoading }: CalendarViewProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    return tasksToCalendarEvents(tasks);
  }, [tasks]);

  const eventStyleGetter = (event: (typeof events)[0]) => {
    const task = event.resource.task;
    const backgroundColor = getTaskStatusColor(task.status);
    const borderColor = backgroundColor;

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderRadius: '4px',
        color: '#fff',
        opacity: task.status === 'done' ? 0.7 : 1
      }
    };
  };

  const handleSelectEvent = useCallback((event: (typeof events)[0]) => {
    if (onTaskClick) {
      onTaskClick(event.resource.task.id);
    }
  }, [onTaskClick]);

  const handleEventDropOrResize = useCallback((args: { event: (typeof events)[0]; start: Date; end: Date }) => {
    if (onEventDrop) {
      onEventDrop(args.event.resource.task.id, args.start, args.end);
    }
  }, [onEventDrop]);

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-950/40 text-sm text-neutral-500">
        Загрузка календаря...
      </div>
    );
  }

  return (
    <div className="rbc-calendar-wrapper h-[600px] rounded-2xl border border-neutral-900 bg-neutral-950/40 p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        draggableAccessor={() => true}
        resizable
        onEventDrop={handleEventDropOrResize}
        onEventResize={handleEventDropOrResize}
        messages={{
          next: 'Следующий',
          previous: 'Предыдущий',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Повестка',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
          noEventsInRange: 'Нет задач в этом диапазоне дат'
        }}
        culture="ru-RU"
        className={cn('text-neutral-100')}
      />
    </div>
  );
}

export default CalendarView;

