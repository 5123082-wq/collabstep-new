'use client';

import { useEffect, useState } from 'react';

type UseCurrencyState = {
  currency: string;
  locale: string;
  loading: boolean;
};

const DEFAULT_STATE: UseCurrencyState = {
  currency: 'RUB',
  locale: 'ru-RU',
  loading: true
};

export function useCurrency(projectId?: string | null): UseCurrencyState {
  const [state, setState] = useState<UseCurrencyState>(DEFAULT_STATE);

  useEffect(() => {
    let cancelled = false;
    async function loadBudgetCurrency() {
      if (!projectId) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/budget`, {
          headers: { 'cache-control': 'no-store' }
        });
        if (!response.ok) {
          throw new Error('Failed to load budget');
        }
        const payload = await response.json();
        if (cancelled) {
          return;
        }

        const currency = typeof payload?.currency === 'string' ? payload.currency : DEFAULT_STATE.currency;
        setState({ currency, locale: DEFAULT_STATE.locale, loading: false });
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    void loadBudgetCurrency();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return state;
}
