import { create } from 'zustand';
import type { WorkspaceData, WorkspaceResponse } from '@/types/workspace';

type FetchOptions = {
  force?: boolean;
};

type WorkspaceState = {
  data: WorkspaceData | null;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  fetch: (options?: FetchOptions) => Promise<void>;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  data: null,
  updatedAt: null,
  isLoading: false,
  error: null,
  initialized: false,
  fetch: async (options) => {
    const force = options?.force ?? false;
    const { isLoading, initialized } = get();

    if (isLoading || (initialized && !force)) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/workspace', {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить рабочее пространство');
      }

      const payload = (await response.json()) as WorkspaceResponse;
      set({
        data: payload.data,
        updatedAt: payload.updatedAt,
        isLoading: false,
        error: null,
        initialized: true
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        isLoading: false,
        initialized: true
      });
    }
  }
}));
