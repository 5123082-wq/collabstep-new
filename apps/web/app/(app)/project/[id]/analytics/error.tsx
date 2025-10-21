'use client';

import { useCallback } from 'react';
import AnalyticsErrorFallback from '@/components/project/AnalyticsErrorFallback';

type AnalyticsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AnalyticsError({ reset }: AnalyticsErrorProps) {
  const handleRetry = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('fail');
      url.searchParams.delete('__simulate_error');
      url.searchParams.delete('session');
      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      window.location.replace(nextPath);
      return;
    }

    reset();
  }, [reset]);

  return <AnalyticsErrorFallback onRetry={handleRetry} />;
}
