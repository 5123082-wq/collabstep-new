'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspace';

export function useWorkspace() {
  const { data, updatedAt, isLoading, error, initialized, fetch } = useWorkspaceStore((state) => ({
    data: state.data,
    updatedAt: state.updatedAt,
    isLoading: state.isLoading,
    error: state.error,
    initialized: state.initialized,
    fetch: state.fetch
  }));

  useEffect(() => {
    if (!initialized && !isLoading) {
      void fetch();
    }
  }, [initialized, isLoading, fetch]);

  const refresh = () => fetch({ force: true });

  return {
    data,
    updatedAt,
    isLoading,
    error,
    refresh
  };
}
