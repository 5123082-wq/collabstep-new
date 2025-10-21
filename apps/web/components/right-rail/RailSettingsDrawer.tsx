'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { defaultRailConfig } from '@/mocks/rail';
import { cn } from '@/lib/utils';
import { useRailPreferencesStore } from '@/stores/railPreferences';
import { useUI } from '@/stores/ui';

export default function RailSettingsDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const isOpen = drawer === 'rail-settings';

  const enabledActionIds = useRailPreferencesStore((state) => state.enabledActionIds);
  const toggleAction = useRailPreferencesStore((state) => state.toggleAction);
  const moveAction = useRailPreferencesStore((state) => state.moveAction);
  const reset = useRailPreferencesStore((state) => state.reset);

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Настройка быстрого доступа</SheetTitle>
          <p className="text-xs text-neutral-400">Выберите действия, которые будут доступны в правом меню.</p>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-6">
          <ol className="space-y-3">
            {defaultRailConfig.map((action) => {
              const Icon = action.icon;
              const enabled = enabledActionIds.includes(action.id);
              return (
                <li key={action.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900/80 text-neutral-200">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-100">{action.label}</p>
                        <p className="text-xs text-neutral-400">{enabled ? 'Показывается в меню' : 'Скрыто'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveAction(action.id, 'up')}
                        className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                        aria-label={`Поднять ${action.label}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAction(action.id, 'down')}
                        className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                        aria-label={`Опустить ${action.label}`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAction(action.id)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                          enabled
                            ? 'border border-indigo-500/60 bg-indigo-500/20 text-indigo-100'
                            : 'border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
                        )}
                        aria-label={enabled ? `Скрыть ${action.label}` : `Показать ${action.label}`}
                      >
                        {enabled ? 'Включено' : 'Выключено'}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="border-t border-neutral-800 bg-neutral-950/80 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-xs text-neutral-400 underline-offset-2 transition hover:text-neutral-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Сбросить по умолчанию
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Готово
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

