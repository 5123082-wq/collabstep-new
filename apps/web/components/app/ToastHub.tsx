'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { TOAST_EVENT, type ToastPayload } from '@/lib/ui/toast';

type ToastItem = Required<Pick<ToastPayload, 'id' | 'message' | 'tone'>>;

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
      setToasts((items) => [...items, { id, message: detail.message, tone }]);
      timersMap[id] = window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id));
        delete timersMap[id];
      }, 3200);
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
          {toast.message}
        </div>
      ))}
    </div>
  );
}
