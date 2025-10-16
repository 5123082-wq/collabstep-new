'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type AnalyticsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AnalyticsError({ reset }: AnalyticsErrorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRetry = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('fail');

    const target = nextParams.size > 0 ? `${pathname}?${nextParams.toString()}` : pathname;

    router.replace(target);
    reset();
  }, [pathname, reset, router, searchParams]);

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-neutral-100">
      <p className="text-lg font-semibold">Не удалось открыть проект</p>
      <button
        type="button"
        onClick={handleRetry}
        className="inline-flex items-center justify-center rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        Повторить попытку
      </button>
    </div>
  );
}
