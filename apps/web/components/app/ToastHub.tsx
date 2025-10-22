'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { TOAST_EVENT, type ToastPayload } from '@/lib/ui/toast';

type ToastItem = {
  id: string;
  message: string;
  tone: NonNullable<ToastPayload['tone']>;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  duration?: number;
};

const toneStyles: Record<ToastItem['tone'], string> = {
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-100'
};

export default function ToastHub() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    const timersMap = timers.current;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      if (!detail?.message) {
        return;
      }

      const id = detail.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const tone = detail.tone ?? 'info';
      const duration = detail.duration ?? (detail.actionLabel ? 6000 : 3200);
      setToasts((items) => [
        ...items,
        {
          id,
          message: detail.message,
          tone,
          actionLabel: detail.actionLabel,
          onAction: detail.onAction,
          duration
        }
      ]);
      timersMap[id] = window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
        delete timersMap[id];
      }, duration);
    };

    document.addEventListener(TOAST_EVENT, handler as EventListener);
    return () => {
      document.removeEventListener(TOAST_EVENT, handler as EventListener);
      Object.values(timersMap).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[150] flex w-80 flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clsx(
            'pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl shadow-neutral-950/40 backdrop-blur',
            toneStyles[toast.tone]
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="leading-tight">{toast.message}</p>
            {toast.actionLabel ? (
              <button
                type="button"
                className="rounded-md border border-current px-2 py-1 text-xs uppercase tracking-[0.18em]"
                onClick={async () => {
                  if (toast.onAction) {
                    try {
                      await toast.onAction();
                    } catch (error) {
                      console.error(error);
                    }
                  }
                  setToasts((items) => items.filter((item) => item.id !== toast.id));
                  if (timersMap[toast.id]) {
                    window.clearTimeout(timersMap[toast.id]!);
                    delete timersMap[toast.id];
                  }
                }}
              >
                {toast.actionLabel}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
