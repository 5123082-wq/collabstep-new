import { create } from 'zustand';
import type { Project } from '@/domain/projects/types';

type ProjectEditorState = {
  project: Project | null;
  loading: boolean;
  error: string | null;
  setProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

export const useProjectEditorStore = create<ProjectEditorState>((set) => ({
  project: null,
  loading: false,
  error: null,
  setProject: (project) => set({ project }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ project: null, loading: false, error: null })
}));

export type { ProjectEditorState };
