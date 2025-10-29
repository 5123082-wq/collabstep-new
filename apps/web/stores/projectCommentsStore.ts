'use client';

import { create } from 'zustand';
import type { TaskComment } from '@/domain/projects/types';

const ENABLED_VALUES = ['1', 'true', 'yes', 'on'];
const FEATURE_ENABLED = (() => {
  if (typeof process === 'undefined') {
    return false;
  }
  const value = process.env.NEXT_PUBLIC_FEATURE_PROJECT_ATTACHMENTS ?? '';
  return ENABLED_VALUES.includes(value.toLowerCase());
})();

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Request failed');
  }
  return (await response.json()) as T;
}

type MentionSuggestion = {
  id: string;
  name: string;
  email: string;
  title?: string;
};

type ProjectCommentsState = {
  projectId: string | null;
  taskId: string | null;
  comments: TaskComment[];
  loading: boolean;
  error: string | null;
  mentions: MentionSuggestion[];
  hydrate: (projectId: string, taskId: string) => Promise<void>;
  refresh: () => Promise<void>;
  createComment: (input: { body: string; parentId?: string | null; mentions?: string[]; attachments?: string[] }) => Promise<void>;
  updateComment: (commentId: string, input: { body?: string; mentions?: string[]; attachments?: string[] }) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  searchMentions: (query: string) => Promise<void>;
  reset: () => void;
};

const defaultState = {
  projectId: null,
  taskId: null,
  comments: [] as TaskComment[],
  loading: false,
  error: null as string | null,
  mentions: [] as MentionSuggestion[]
};

async function loadTaskComments(projectId: string, taskId: string): Promise<TaskComment[]> {
  if (!FEATURE_ENABLED) {
    return [];
  }
  const data = await fetchJson<{ items?: TaskComment[] }>(
    `/api/projects/${projectId}/tasks/${taskId}/comments`
  );
  return Array.isArray(data.items) ? data.items : [];
}

export const useProjectCommentsStore = create<ProjectCommentsState>((set, get) => ({
  ...defaultState,
  reset: () => set({ ...defaultState }),
  hydrate: async (projectId: string, taskId: string) => {
    if (!FEATURE_ENABLED) {
      set({ projectId, taskId, comments: [] });
      return;
    }
    set({ projectId, taskId, loading: true, error: null });
    try {
      const comments = await loadTaskComments(projectId, taskId);
      set({ comments, loading: false });
    } catch (error) {
      console.error(error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Не удалось загрузить комментарии'
      });
    }
  },
  refresh: async () => {
    const { projectId, taskId } = get();
    if (!projectId || !taskId || !FEATURE_ENABLED) {
      return;
    }
    try {
      const comments = await loadTaskComments(projectId, taskId);
      set({ comments });
    } catch (error) {
      console.error(error);
    }
  },
  createComment: async ({ body, parentId, mentions, attachments }) => {
    const { projectId, taskId } = get();
    if (!projectId || !taskId || !FEATURE_ENABLED) {
      return;
    }
    await fetchJson(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, parentId: parentId ?? null, mentions: mentions ?? [], attachments: attachments ?? [] })
    });
    await get().refresh();
  },
  updateComment: async (commentId, input) => {
    const { projectId, taskId } = get();
    if (!projectId || !taskId || !FEATURE_ENABLED) {
      return;
    }
    await fetchJson(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    await get().refresh();
  },
  deleteComment: async (commentId) => {
    const { projectId, taskId } = get();
    if (!projectId || !taskId || !FEATURE_ENABLED) {
      return;
    }
    await fetchJson(`/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    });
    await get().refresh();
  },
  searchMentions: async (query) => {
    if (!FEATURE_ENABLED) {
      set({ mentions: [] });
      return;
    }
    const q = query.trim();
    if (!q) {
      set({ mentions: [] });
      return;
    }
    try {
      const data = await fetchJson<{ items?: MentionSuggestion[] }>(`/api/users/search?q=${encodeURIComponent(q)}`);
      set({ mentions: Array.isArray(data.items) ? data.items : [] });
    } catch (error) {
      console.error(error);
      set({ mentions: [] });
    }
  }
}));

export type { ProjectCommentsState, MentionSuggestion };
