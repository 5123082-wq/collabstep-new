'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AnalyticsErrorFallback from './AnalyticsErrorFallback';

type AnalyticsErrorSimulationProps = {
  sessionId?: string | null;
};

export default function AnalyticsErrorSimulation({ sessionId }: AnalyticsErrorSimulationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRetry = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('fail');
    params.delete('__simulate_error');
    params.delete('session');

    if (sessionId) {
      params.set('session', `${sessionId}-recovered`);
    }

    const query = params.toString();
    const nextPath = `${pathname}${query ? `?${query}` : ''}`;

    router.replace(nextPath);
    router.refresh();
  }, [pathname, router, searchParams, sessionId]);

  return <AnalyticsErrorFallback onRetry={handleRetry} />;
}
