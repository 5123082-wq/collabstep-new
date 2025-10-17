'use client';

import type { ReactNode } from 'react';

type AnalyticsErrorFallbackProps = {
  onRetry: () => void;
  message?: ReactNode;
};

export default function AnalyticsErrorFallback({ onRetry, message }: AnalyticsErrorFallbackProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-neutral-100">
      <p className="text-lg font-semibold">{message ?? 'Не удалось открыть проект'}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        Повторить попытку
      </button>
    </div>
  );
}
