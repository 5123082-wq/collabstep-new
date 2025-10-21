'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from '@/lib/ui/toast';

const routeActions: Record<string, { title: string; actions: { label: string; message: string }[] }> = {
  '/app/dashboard': {
    title: 'Быстрые действия',
    actions: [
      { label: 'Открыть отчёт за неделю', message: 'TODO: Отчёт за неделю' },
      { label: 'Созвон с командой', message: 'TODO: Созвон' }
    ]
  },
  '/project': {
    title: 'Проекты',
    actions: [
      { label: 'Новый проект', message: 'TODO: Новый проект' },
      { label: 'Добавить задачу', message: 'TODO: Добавить задачу' },
      { label: 'Пригласить участника', message: 'TODO: Пригласить участника' }
    ]
  },
  '/app/marketplace': {
    title: 'Маркетплейс',
    actions: [
      { label: 'Открыть витрину', message: 'TODO: Открыть витрину решений' },
      { label: 'Добавить в корзину', message: 'TODO: Добавить товар в корзину' },
      { label: 'Перейти к заказам', message: 'TODO: Открыть историю заказов' }
    ]
  },
  '/app/performers': {
    title: 'Исполнители',
    actions: [
      { label: 'Найти специалиста', message: 'TODO: Найти специалиста' },
      { label: 'Разместить вакансию', message: 'TODO: Создать вакансию' },
      { label: 'Просмотреть отклики', message: 'TODO: Открыть отклики исполнителей' }
    ]
  },
  '/app/ai-hub': {
    title: 'AI-хаб',
    actions: [
      { label: 'Запустить генерацию', message: 'TODO: Генерация' },
      { label: 'Создать промпт', message: 'TODO: Создать промпт' }
    ]
  },
  '/app/community': {
    title: 'Комьюнити',
    actions: [
      { label: 'Поделиться апдейтом', message: 'TODO: Поделиться апдейтом' },
      { label: 'Создать событие', message: 'TODO: Создать событие' }
    ]
  },
  '/app/finance': {
    title: 'Финансы',
    actions: [
      { label: 'Открыть эскроу', message: 'TODO: Открыть эскроу' },
      { label: 'Создать счёт', message: 'TODO: Создать счёт' }
    ]
  },
  '/app/docs': {
    title: 'Документы',
    actions: [
      { label: 'Загрузить файл', message: 'TODO: Загрузить файл' },
      { label: 'Создать шаблон', message: 'TODO: Создать шаблон' }
    ]
  },
  '/app/profile': {
    title: 'Профиль',
    actions: [
      { label: 'Редактировать карточку', message: 'TODO: Редактировать профиль' },
      { label: 'Запросить отзыв', message: 'TODO: Запросить отзыв' }
    ]
  },
  '/app/org': {
    title: 'Организация',
    actions: [
      { label: 'Добавить сотрудника', message: 'TODO: Добавить сотрудника' },
      { label: 'Синхронизировать биллинг', message: 'TODO: Синхронизировать биллинг' }
    ]
  },
  '/app/support': {
    title: 'Поддержка',
    actions: [
      { label: 'Создать тикет', message: 'TODO: Создать тикет' },
      { label: 'Связаться с менеджером', message: 'TODO: Связаться с менеджером' }
    ]
  }
};

export default function RightActionsPanel() {
  const pathname = usePathname();

  const matched = useMemo(() => {
    const entry = Object.entries(routeActions).find(([prefix]) => pathname.startsWith(prefix));
    return entry ? entry[1] : null;
  }, [pathname]);

  if (!matched) {
    return (
      <aside className="hidden w-[280px] flex-col border-l border-neutral-900/60 bg-neutral-950/70 px-4 py-6 lg:flex">
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 p-4 text-sm text-neutral-400">
          Быстрых действий пока нет.
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden w-[280px] flex-col border-l border-neutral-900/60 bg-neutral-950/70 px-4 py-6 lg:flex">
      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/60 p-4">
        <h3 className="text-sm font-semibold text-neutral-100">{matched.title}</h3>
        <ul className="mt-3 space-y-2">
          {matched.actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                onClick={() => toast(action.message)}
                className="w-full rounded-xl border border-neutral-800/70 bg-neutral-950/60 px-3 py-2 text-left text-sm text-neutral-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
