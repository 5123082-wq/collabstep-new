'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { defaultRailConfig } from '@/mocks/rail';
import { cn } from '@/lib/utils';
import { railIconOptions, resolveRailIcon } from '@/config/railIcons';
import type { RailIconId } from '@/config/railIcons';
import {
  useRailPreferencesStore,
  type CreateCustomRailActionInput,
  type PersistedCustomRailAction
} from '@/stores/railPreferences';
import { useUI } from '@/stores/ui';
import type { QuickAction } from '@/types/quickActions';

type DisplayAction = QuickAction & { source: 'default' | 'custom'; raw?: PersistedCustomRailAction };

const DEFAULT_ICON: RailIconId = railIconOptions[0]?.id ?? ('plusCircle' as RailIconId);

export default function RailSettingsDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const isOpen = drawer === 'rail-settings';

  const enabledActionIds = useRailPreferencesStore((state) => state.enabledActionIds);
  const toggleAction = useRailPreferencesStore((state) => state.toggleAction);
  const moveAction = useRailPreferencesStore((state) => state.moveAction);
  const reset = useRailPreferencesStore((state) => state.reset);
  const addCustomAction = useRailPreferencesStore((state) => state.addCustomAction);
  const removeCustomAction = useRailPreferencesStore((state) => state.removeCustomAction);
  const customActions = useRailPreferencesStore((state) => state.customActions);

  const [label, setLabel] = useState('');
  const [type, setType] = useState<'route' | 'command'>('route');
  const [target, setTarget] = useState('');
  const [iconId, setIconId] = useState(DEFAULT_ICON);

  const actions = useMemo<DisplayAction[]>(() => {
    const defaults = defaultRailConfig.map((action) => ({
      ...action,
      source: 'default' as const
    }));
    const customs = customActions.map((action) => {
      const base: DisplayAction = {
        id: action.id,
        label: action.label,
        icon: resolveRailIcon(action.icon),
        intent: action.intent,
        section: action.section ?? 'custom',
        source: 'custom' as const,
        raw: action
      };
      if (action.payload) {
        base.payload = action.payload;
      }
      return base;
    });
    return [...defaults, ...customs];
  }, [customActions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedLabel = label.trim();
    const trimmedTarget = target.trim();
    if (!trimmedLabel) {
      return;
    }

    const payload: CreateCustomRailActionInput['payload'] =
      type === 'route'
        ? { to: trimmedTarget || '/app/dashboard' }
        : {
            toastMessage:
              trimmedTarget || `Горячая кнопка «${trimmedLabel}» активирована`
          };

    const input: CreateCustomRailActionInput = {
      label: trimmedLabel,
      icon: iconId,
      intent: type,
      payload,
      section: 'custom'
    };
    addCustomAction(input);
    setLabel('');
    setTarget('');
    setType('route');
    setIconId(DEFAULT_ICON);
  };

  const canSubmit = label.trim().length > 0 && (type === 'route' ? true : target.trim().length > 0);

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Настройка быстрого доступа</SheetTitle>
          <p className="text-xs text-neutral-400">
            Управляйте быстрыми действиями и добавляйте собственные кнопки в правое меню.
          </p>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
            <h3 className="text-sm font-semibold text-neutral-100">Новая горячая кнопка</h3>
            <p className="mt-1 text-xs text-neutral-400">
              Задайте название, действие и иконку. Кнопка появится в меню сразу после сохранения.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-300">Название</span>
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Например, Создать бриф"
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500/60 focus:outline-none"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-300">Тип действия</span>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value as 'route' | 'command')}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500/60 focus:outline-none"
                  >
                    <option value="route">Переход по ссылке</option>
                    <option value="command">Сообщение</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-300">Иконка</span>
                  <select
                    value={iconId}
                    onChange={(event) => setIconId(event.target.value as RailIconId)}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500/60 focus:outline-none"
                  >
                    {railIconOptions.map(({ id, label: optionLabel }) => (
                      <option key={id} value={id}>
                        {optionLabel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-300">{type === 'route' ? 'Ссылка' : 'Сообщение'}</span>
                <input
                  type="text"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder={type === 'route' ? '/app/dashboard' : 'Текст уведомления'}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500/60 focus:outline-none"
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300',
                    canSubmit
                      ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                      : 'cursor-not-allowed bg-neutral-800 text-neutral-500'
                  )}
                >
                  Добавить кнопку
                </button>
              </div>
            </form>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-100">Доступные действия</h3>
            <ol className="space-y-3">
              {actions.map((action) => {
                const Icon = action.icon;
                const enabled = enabledActionIds.includes(action.id);
                const isCustom = action.source === 'custom';
                const description = (() => {
                  if (!enabled) {
                    return 'Скрыто';
                  }
                  if (isCustom) {
                    if (action.intent === 'route') {
                      const to = (action.raw?.payload as { to?: string })?.to;
                      return to ? `Открывает: ${to}` : 'Пользовательское действие';
                    }
                    if (action.intent === 'command') {
                      const message = (action.raw?.payload as { toastMessage?: string })?.toastMessage;
                      return message ? `Показывает сообщение` : 'Пользовательское действие';
                    }
                    return 'Пользовательское действие';
                  }
                  return 'Показывается в меню';
                })();

                return (
                  <li key={action.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900/80 text-neutral-200">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-neutral-100">{action.label}</p>
                          <p className="text-xs text-neutral-400">{description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
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
                        {isCustom ? (
                          <button
                            type="button"
                            onClick={() => removeCustomAction(action.id)}
                            className="rounded-full border border-rose-500/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                          >
                            Удалить
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {customActions.length === 0 ? (
              <p className="text-xs text-neutral-500">
                Пока нет пользовательских кнопок. Добавьте первую выше, чтобы ускорить привычные действия.
              </p>
            ) : null}
          </section>
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

