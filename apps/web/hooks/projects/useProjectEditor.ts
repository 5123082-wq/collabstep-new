'use client';

import { useCallback } from 'react';
import { projectSectionApi } from '@/lib/api/project';
import { useProjectEditorStore } from '@/stores/projectEditor';

const LOAD_ERROR_MESSAGE = 'Не удалось загрузить данные проекта';

export function useProjectEditor() {
  const { project, loading, error, setProject, setLoading, setError, reset } = useProjectEditorStore((state) => ({
    project: state.project,
    loading: state.loading,
    error: state.error,
    setProject: state.setProject,
    setLoading: state.setLoading,
    setError: state.setError,
    reset: state.reset
  }));

  const loadProject = useCallback(
    async (projectId: string) => {
      setLoading(true);
      try {
        const data = await projectSectionApi.fetchProject(projectId);
        setProject(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(LOAD_ERROR_MESSAGE);
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setProject]
  );

  return {
    project,
    loading,
    error,
    setProject,
    setError,
    reset,
    loadProject
  };
}
