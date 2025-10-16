'use client';

import { useCallback } from 'react';
import ErrorFallback from '@/components/ui/ErrorFallback';

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProjectError({ reset }: RouteErrorProps) {
  const handleRetry = useCallback(async () => {
    if (typeof window !== 'undefined' && window.location.search.includes('__simulate_error')) {
      const url = new URL(window.location.href);
      const session = url.searchParams.get('session');
      if (session) {
        url.searchParams.set('session', `${session}-recovered`);
      } else {
        url.searchParams.set('session', 'recovered');
      }
      url.searchParams.set('__simulate_error', '1');
      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      window.location.href = nextPath;
      return false;
    }
  }, []);

  return (
    <div className="bg-neutral-950 px-6 py-16 text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <ErrorFallback
          title="Не удалось открыть проект"
          description="Попробуйте обновить страницу. Если ошибка повторяется, вернитесь к списку проектов."
          reset={reset}
          onRetry={handleRetry}
          links={[
            { href: '/app/projects', label: 'Список проектов' },
            { href: '/app/dashboard', label: 'Рабочий стол' }
          ]}
        />
      </div>
    </div>
  );
}
