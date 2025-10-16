'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/lib/ui/toast';

const ACTIONS = [
  { id: 'invite', label: 'Пригласить', toastMessage: 'TODO: Пригласить участника' },
  { id: 'vacancy', label: 'Открыть вакансию', toastMessage: 'TODO: Открыть вакансию' },
  { id: 'estimate', label: 'Запросить смету', toastMessage: 'TODO: Запросить смету' },
  { id: 'escrow', label: 'Открыть эскроу', toastMessage: 'TODO: Открыть эскроу' },
  { id: 'settings', label: 'Настройки проекта', toastMessage: 'TODO: Настройки проекта' }
] as const;

type ProjectActionsProps = {
  className?: string;
};

export default function ProjectActions({ className }: ProjectActionsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const primaryAction = ACTIONS[0];
  const secondaryActions = useMemo(() => ACTIONS.slice(1), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const handlePointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && event.target !== toggleRef.current) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointer);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointer);
    };
  }, [open]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toast(primaryAction.toastMessage)}
          className="rounded-2xl border border-indigo-500/60 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          aria-label="Пригласить участника в проект"
        >
          {primaryAction.label}
        </button>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {secondaryActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => toast(action.toastMessage)}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              aria-label={action.label}
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="relative md:hidden" ref={menuRef}>
          <button
            type="button"
            ref={toggleRef}
            onClick={() => setOpen((state) => !state)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-label="Дополнительные действия проекта"
          >
            <span className="text-lg leading-none">…</span>
          </button>
          {open && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-neutral-900 bg-neutral-950/95 p-2 shadow-lg shadow-black/50"
            >
              {secondaryActions.map((action) => (
                <button
                  key={action.id}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    toast(action.toastMessage);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-neutral-200 transition hover:bg-indigo-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
