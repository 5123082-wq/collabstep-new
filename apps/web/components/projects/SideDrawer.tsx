'use client';

import { useEffect, useMemo, useRef, type ReactNode, type SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { createEscapeKeyHandler, formatDrawerSubtitle, getDrawerTitle } from '@/stores/projectDrawer';

export type SideDrawerTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  entityType: string | null;
  entityId: string | null;
  mode: string | null;
  tabs?: SideDrawerTab[];
  footer?: ReactNode;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export default function SideDrawer({ open, onClose, entityType, entityId, mode, tabs, footer }: SideDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const activeTab = tabs?.[0];
  const subtitle = useMemo(() => formatDrawerSubtitle(entityId, mode), [entityId, mode]);
  const title = useMemo(() => getDrawerTitle(entityType), [entityType]);
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handler = createEscapeKeyHandler(onClose);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const node = panelRef.current;
    if (!node) {
      return;
    }
    const handleTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        return;
      }
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', handleTrap);
    return () => node.removeEventListener('keydown', handleTrap);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <SheetContent
        side="right"
        className="flex h-full flex-col overflow-hidden border-neutral-800 bg-neutral-950/90 text-neutral-100 shadow-2xl backdrop-blur"
        aria-label={title}
      >
        <div ref={panelRef} className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-neutral-800 px-6 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{entityType ?? 'entity'}</p>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {subtitle ? <p className="text-sm text-neutral-400">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/70 text-neutral-400 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              aria-label="Закрыть карточку"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {tabs?.length ? (
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900/70 p-1">
                  {tabs.map((tab, index) => {
                    const isSelected = index === 0;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                          isSelected ? 'bg-indigo-500 text-white shadow' : 'text-neutral-300 hover:bg-neutral-800/70 hover:text-white'
                        )}
                        disabled={!isSelected}
                        aria-current={isSelected ? 'page' : undefined}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-950/60 p-6">
                  {activeTab?.content ?? (
                    <p className="text-sm text-neutral-400">
                      Содержимое карточки появится в следующих итерациях.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-950/60 p-6 text-sm text-neutral-400">
                Содержимое карточки появится в следующих итерациях.
              </div>
            )}
          </div>
          <footer className="border-t border-neutral-800 bg-neutral-950/80 px-6 py-4">
            {footer ?? (
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Универсальный drawer</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-neutral-800 px-4 py-1 text-xs font-semibold text-neutral-400 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Закрыть
                </button>
              </div>
            )}
          </footer>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
