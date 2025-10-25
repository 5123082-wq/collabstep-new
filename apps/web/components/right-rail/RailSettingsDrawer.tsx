'use client';

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { defaultRailConfig } from '@/mocks/rail';
import { cn } from '@/lib/utils';
import { DEFAULT_RAIL_ICON_ID, railIconOptions, resolveRailIcon } from '@/lib/railIcons';
import type { QuickAction } from '@/types/quickActions';
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
  const removeCustomAction = useRailPreferencesStore((state) => state.removeCustomAction);

  const [newLabel, setNewLabel] = useState('');
  const [newPath, setNewPath] = useState('');
  const [newIcon, setNewIcon] = useState(DEFAULT_RAIL_ICON_ID);

  const customActionMap = useMemo(() => new Map(customActions.map((action) => [action.id, action])), [customActions]);

  const resolvedCustomActions = useMemo<QuickAction[]>(
    () =>
      customActions.map((action) => ({
        id: action.id,
        label: action.label,
        icon: resolveRailIcon(action.icon),
        intent: action.intent,
        section: action.section ?? 'custom',
        ...(action.payload ? { payload: action.payload } : {})
      })),
    [customActions]
  );

  const availableActions = useMemo<QuickAction[]>(() => {
    const combined = [...defaultRailConfig, ...resolvedCustomActions];
    const availableMap = new Map(combined.map((action) => [action.id, action]));
    const orderedIds = [
      ...enabledActionIds,
      ...combined.map((action) => action.id).filter((id) => !enabledActionIds.includes(id))
    ];
    return orderedIds
      .map((id) => availableMap.get(id))
      .filter((action): action is QuickAction => Boolean(action));
  }, [enabledActionIds, resolvedCustomActions]);

  const customActionIds = useMemo(() => new Set(customActions.map((action) => action.id)), [customActions]);

  const handleAddCustomAction = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const label = newLabel.trim();
      const target = newPath.trim();
      if (!label || !target) {
        return;
      }
      addCustomAction({
        label,
        icon: newIcon,
        intent: 'route',
        payload: { to: target },
        section: 'custom'
      });
      setNewLabel('');
      setNewPath('');
      setNewIcon(DEFAULT_RAIL_ICON_ID);
    },
    [addCustomAction, newIcon, newLabel, newPath]
  );

  const handleReset = useCallback(() => {
    reset();
    setNewLabel('');
    setNewPath('');
    setNewIcon(DEFAULT_RAIL_ICON_ID);
  }, [reset]);

  const isSubmitDisabled = newLabel.trim().length === 0 || newPath.trim().length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full flex-col bg-neutral-900/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="px-6 py-4">
          <SheetTitle>Настройка быстрого доступа</SheetTitle>
          <p className="text-xs text-neutral-400">Выберите действия, которые будут доступны в правом меню.</p>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Доступные действия</h3>
            <ol className="mt-3 space-y-3">
              {availableActions.map((action) => {
                const Icon = action.icon;
                const enabled = enabledActionIds.includes(action.id);
                const isCustom = customActionIds.has(action.id);
                const storedCustom = customActionMap.get(action.id);
                return (
                  <li key={action.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900/80 text-neutral-200">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-100">{action.label}</p>
                          <p className="truncate text-xs text-neutral-400">
                            {enabled ? 'Показывается в меню' : 'Скрыто'}
                            {isCustom && storedCustom?.payload && typeof storedCustom.payload.to === 'string'
                              ? ` • ${storedCustom.payload.to}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveAction(action.id, 'up')}
                          disabled={!enabled}
                          className={cn(
                            'rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                            enabled
                              ? 'hover:border-indigo-500/40 hover:text-white'
                              : 'cursor-not-allowed opacity-60'
                          )}
                          aria-label={`Поднять ${action.label}`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveAction(action.id, 'down')}
                          disabled={!enabled}
                          className={cn(
                            'rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                            enabled
                              ? 'hover:border-indigo-500/40 hover:text-white'
                              : 'cursor-not-allowed opacity-60'
                          )}
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
                            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 transition hover:border-red-500/50 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                            aria-label={`Удалить ${action.label}`}
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
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
            <h3 className="text-sm font-semibold text-neutral-100">Новая горячая кнопка</h3>
            <p className="mt-1 text-xs text-neutral-400">Создайте персональный ярлык для быстрого доступа к любой ссылке.</p>
            <form className="mt-4 space-y-4" onSubmit={handleAddCustomAction}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300" htmlFor="rail-custom-label">
                  Название
                </label>
                <Input
                  id="rail-custom-label"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                  placeholder="Например, Бриф клиента"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-300" htmlFor="rail-custom-path">
                  Ссылка
                </label>
                <Input
                  id="rail-custom-path"
                  value={newPath}
                  onChange={(event) => setNewPath(event.target.value)}
                  placeholder="/app/dashboard"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-neutral-300">Иконка</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {railIconOptions.map((option) => {
                    const Icon = option.icon;
                    const selected = newIcon === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setNewIcon(option.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                          selected
                            ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-100'
                            : 'border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-indigo-500/40 hover:text-white'
                        )}
                        aria-pressed={selected}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900/80">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={cn(
                  'w-full rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300',
                  isSubmitDisabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-indigo-400'
                )}
              >
                Добавить кнопку
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-neutral-800 bg-neutral-950/80 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
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

