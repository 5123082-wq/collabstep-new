'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { defaultRailConfig } from '@/mocks/rail';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { railIconOptions, getRailIconComponent, DEFAULT_RAIL_ICON } from '@/components/right-rail/railIcons';
import { useRailPreferencesStore } from '@/stores/railPreferences';
import { useUI } from '@/stores/ui';

export default function RailSettingsDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const isOpen = drawer === 'rail-settings';

  const enabledActionIds = useRailPreferencesStore((state) => state.enabledActionIds);
  const customActions = useRailPreferencesStore((state) => state.customActions);
  const toggleAction = useRailPreferencesStore((state) => state.toggleAction);
  const moveAction = useRailPreferencesStore((state) => state.moveAction);
  const reset = useRailPreferencesStore((state) => state.reset);
  const addCustomAction = useRailPreferencesStore((state) => state.addCustomAction);
  const updateCustomAction = useRailPreferencesStore((state) => state.updateCustomAction);
  const removeCustomAction = useRailPreferencesStore((state) => state.removeCustomAction);

  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState(DEFAULT_RAIL_ICON);

  const NewIconPreview = useMemo(() => getRailIconComponent(newIcon), [newIcon]);

  const orderedCustomActions = useMemo(() => {
    return customActions.slice().sort((a, b) => {
      const indexA = enabledActionIds.indexOf(a.id);
      const indexB = enabledActionIds.indexOf(b.id);
      if (indexA === -1 && indexB === -1) {
        return a.label.localeCompare(b.label);
      }
      if (indexA === -1) {
        return 1;
      }
      if (indexB === -1) {
        return -1;
      }
      return indexA - indexB;
    });
  }, [customActions, enabledActionIds]);

  const handleAddCustomAction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addCustomAction({ label: newLabel, url: newUrl, iconName: newIcon });
    setNewLabel('');
    setNewUrl('');
    setNewIcon(DEFAULT_RAIL_ICON);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Настройка быстрого доступа</SheetTitle>
          <p className="text-xs text-neutral-400">Выберите действия, которые будут доступны в правом меню.</p>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <section aria-labelledby="rail-default-actions">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="rail-default-actions" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Основные действия
              </h2>
            </div>
            <ol className="space-y-3">
              {defaultRailConfig.map((action) => {
                const Icon = action.icon;
                const enabled = enabledActionIds.includes(action.id);
                return (
                  <li key={action.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          </section>

          <section aria-labelledby="rail-custom-actions" className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 id="rail-custom-actions" className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Пользовательские кнопки
              </h2>
              <p className="text-xs text-neutral-500">
                Добавьте быстрые действия, ведущие на нужные разделы.
              </p>
            </div>

            <form
              className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-950/40 p-4"
              onSubmit={handleAddCustomAction}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-neutral-300" htmlFor="rail-custom-label">
                    Название
                  </label>
                  <Input
                    id="rail-custom-label"
                    placeholder="Например, CRM"
                    value={newLabel}
                    onChange={(event) => setNewLabel(event.target.value)}
                    required
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-neutral-300" htmlFor="rail-custom-url">
                    Ссылка
                  </label>
                  <Input
                    id="rail-custom-url"
                    placeholder="/app/crm"
                    value={newUrl}
                    onChange={(event) => setNewUrl(event.target.value)}
                    required
                  />
                </div>
                <div className="w-full space-y-1 sm:w-[180px]">
                  <label className="text-xs font-medium text-neutral-300" htmlFor="rail-custom-icon">
                    Иконка
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="rail-custom-icon"
                      value={newIcon}
                      onChange={(event) => setNewIcon(event.target.value)}
                      className="h-10 flex-1 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 text-sm text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                    >
                      {railIconOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80">
                      <NewIconPreview className="h-5 w-5 text-neutral-200" aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                >
                  Добавить
                </button>
              </div>
            </form>

            {orderedCustomActions.length > 0 ? (
              <ol className="space-y-3">
                {orderedCustomActions.map((action) => {
                  const Icon = getRailIconComponent(action.iconName);
                  const enabled = enabledActionIds.includes(action.id);
                  return (
                    <li key={action.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                            <button
                              type="button"
                              onClick={() => removeCustomAction(action.id)}
                              className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                              aria-label={`Удалить ${action.label}`}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-1">
                            <span className="text-xs font-medium text-neutral-300">Название</span>
                            <Input
                              value={action.label}
                              onChange={(event) => updateCustomAction(action.id, { label: event.target.value })}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-xs font-medium text-neutral-300">Ссылка</span>
                            <Input
                              value={action.url}
                              onChange={(event) => updateCustomAction(action.id, { url: event.target.value })}
                            />
                          </label>
                          <label className="space-y-1 sm:col-span-2">
                            <span className="text-xs font-medium text-neutral-300">Иконка</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={action.iconName}
                                onChange={(event) => updateCustomAction(action.id, { iconName: event.target.value })}
                                className="h-10 flex-1 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 text-sm text-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                              >
                                {railIconOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80">
                                <Icon className="h-5 w-5 text-neutral-200" aria-hidden="true" />
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
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

