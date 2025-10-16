'use client';

import { useEffect } from 'react';

export default function AnalyticsSuccessCleanup(): null {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    const hasParams = url.searchParams.has('__simulate_error') || url.searchParams.has('session');
    if (!hasParams) {
      return;
    }

    url.searchParams.delete('__simulate_error');
    url.searchParams.delete('session');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(null, '', next);
  }, []);

  return null;
}
