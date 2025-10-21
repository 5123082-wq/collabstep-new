'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/lib/ui/toast';
import { useUI } from '@/stores/ui';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' }
] as const;

export default function TaskDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const isOpen = drawer === 'task';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITY_OPTIONS)[number]['value']>('medium');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      toast('Добавьте название задачи');
      return;
    }
    toast(`Задача «${trimmed}» сохранена`);
    closeDrawer();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Новая задача</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium text-neutral-200">
              Заголовок
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
              placeholder="Например: Подготовить презентацию"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium text-neutral-200">
              Описание
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[140px] w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
              placeholder="Кратко опишите задачу, критерии готовности и ожидания."
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-neutral-200">Приоритет</span>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((option) => {
                const isActive = priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                      isActive
                        ? 'border border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                        : 'border border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-3 border-t border-neutral-800 pt-6">
            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Сохранить задачу
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Отменить
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

