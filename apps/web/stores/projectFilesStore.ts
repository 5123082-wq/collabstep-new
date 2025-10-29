'use client';

import { create } from 'zustand';
import type { Attachment, DocumentWithVersions } from '@/domain/projects/types';

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

type ProjectFilesState = {
  projectId: string | null;
  attachments: Attachment[];
  documents: DocumentWithVersions[];
  loading: boolean;
  error: string | null;
  hydrate: (projectId: string) => Promise<void>;
  refreshAttachments: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  uploadAttachment: (file: File, options?: { entityId?: string; entityType?: Attachment['linkedEntity'] }) => Promise<void>;
  attachExistingFile: (fileId: string, options?: { entityId?: string; entityType?: Attachment['linkedEntity'] }) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  createDocument: (input: { title: string; type?: string; status?: string }) => Promise<void>;
  uploadDocumentVersion: (
    documentId: string,
    payload: { file: File | null; fileId?: string; notes?: string }
  ) => Promise<void>;
  reset: () => void;
};

const defaultState = {
  projectId: null,
  attachments: [] as Attachment[],
  documents: [] as DocumentWithVersions[],
  loading: false,
  error: null as string | null
};

async function loadProjectAttachments(projectId: string): Promise<Attachment[]> {
  if (!FEATURE_ENABLED) {
    return [];
  }
  const data = await fetchJson<{ items?: Attachment[] }>(`/api/projects/${projectId}/files`);
  return Array.isArray(data.items) ? data.items : [];
}

async function loadProjectDocuments(projectId: string): Promise<DocumentWithVersions[]> {
  if (!FEATURE_ENABLED) {
    return [];
  }
  const data = await fetchJson<{ items?: DocumentWithVersions[] }>(`/api/projects/${projectId}/documents`);
  return Array.isArray(data.items) ? data.items : [];
}

export const useProjectFilesStore = create<ProjectFilesState>((set, get) => ({
  ...defaultState,
  reset: () => set({ ...defaultState }),
  hydrate: async (projectId: string) => {
    if (!FEATURE_ENABLED) {
      set({ projectId, attachments: [], documents: [] });
      return;
    }
    set({ projectId, loading: true, error: null });
    try {
      const [attachments, documents] = await Promise.all([
        loadProjectAttachments(projectId),
        loadProjectDocuments(projectId)
      ]);
      set({ attachments, documents, loading: false });
    } catch (error) {
      console.error(error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Не удалось загрузить файлы'
      });
    }
  },
  refreshAttachments: async () => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    try {
      const attachments = await loadProjectAttachments(projectId);
      set({ attachments });
    } catch (error) {
      console.error(error);
    }
  },
  refreshDocuments: async () => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    try {
      const documents = await loadProjectDocuments(projectId);
      set({ documents });
    } catch (error) {
      console.error(error);
    }
  },
  uploadAttachment: async (file, options) => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    const formData = new FormData();
    formData.set('file', file);
    formData.set('linkedEntity', options?.entityType ?? 'project');
    if (options?.entityId) {
      formData.set('entityId', options.entityId);
    }
    await fetchJson(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData
    });
    await get().refreshAttachments();
  },
  attachExistingFile: async (fileId, options) => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    await fetchJson(`/api/projects/${projectId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        linkedEntity: options?.entityType ?? 'project',
        entityId: options?.entityId ?? null
      })
    });
    await get().refreshAttachments();
  },
  removeAttachment: async (attachmentId) => {
    const { projectId, attachments } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    const attachment = attachments.find((item) => item.id === attachmentId);
    if (attachment?.fileId) {
      await fetchJson(`/api/files/${attachment.fileId}`, { method: 'DELETE' });
    }
    await get().refreshAttachments();
  },
  createDocument: async (input) => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    await fetchJson(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    await get().refreshDocuments();
  },
  uploadDocumentVersion: async (documentId, payload) => {
    const { projectId } = get();
    if (!projectId || !FEATURE_ENABLED) {
      return;
    }
    if (!payload.file && !payload.fileId) {
      throw new Error('Не выбран файл для версии');
    }
    let body: FormData | string;
    let headers: Record<string, string> | undefined;
    if (payload.file) {
      const formData = new FormData();
      formData.set('file', payload.file);
      if (payload.notes) {
        formData.set('notes', payload.notes);
      }
      body = formData;
    } else {
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({ fileId: payload.fileId, notes: payload.notes ?? null });
    }
    const init: RequestInit = headers
      ? { method: 'POST', body, headers }
      : { method: 'POST', body };
    await fetchJson(`/api/projects/${projectId}/documents/${documentId}/versions`, init);
    await get().refreshDocuments();
    await get().refreshAttachments();
  }
}));

export type { ProjectFilesState };
