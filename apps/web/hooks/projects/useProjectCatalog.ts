'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { CreateProjectPayload } from '@/domain/projects/ProjectSectionAPI';
import { projectSectionApi, projectToCatalogItem } from '@/lib/api/project';
import { useProjectCatalogStore } from '@/stores/projectCatalog';

const FALLBACK_ERROR_MESSAGE = 'Не удалось загрузить список проектов';

export function useProjectCatalog() {
  const {
    projects,
    loading,
    error,
    initialized,
    searchQuery,
    selectedProjectId,
    setProjects,
    setLoading,
    setError,
    setSearchQuery,
    selectProject,
    setInitialized,
    upsertProject
  } = useProjectCatalogStore((state) => ({
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    searchQuery: state.searchQuery,
    selectedProjectId: state.selectedProjectId,
    setProjects: state.setProjects,
    setLoading: state.setLoading,
    setError: state.setError,
    setSearchQuery: state.setSearchQuery,
    selectProject: state.selectProject,
    setInitialized: state.setInitialized,
    upsertProject: state.upsertProject
  }));

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectSectionApi.fetchCatalogProjects();
      setProjects(data);
      setError(null);
      setInitialized(true);
    } catch (err) {
      console.error(err);
      setError(FALLBACK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [setError, setInitialized, setLoading, setProjects]);

  useEffect(() => {
    if (!initialized && !loading) {
      void refresh();
    }
  }, [initialized, loading, refresh]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return projects;
    }
    return projects.filter((project) => project.title.toLowerCase().includes(query));
  }, [projects, searchQuery]);

  const handleSelectProject = useCallback(
    (projectId: string | null) => {
      selectProject(projectId);
    },
    [selectProject]
  );

  const createProject = useCallback(
    async (payload: CreateProjectPayload) => {
      setLoading(true);
      try {
        const project = await projectSectionApi.createProject(payload);
        const catalogItem = projectToCatalogItem(project);
        upsertProject(catalogItem);
        setError(null);
        setInitialized(true);
      } catch (err) {
        console.error(err);
        setError('Не удалось создать проект');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setInitialized, setLoading, upsertProject]
  );

  return {
    projects,
    filteredProjects,
    loading,
    error,
    initialized,
    searchQuery,
    selectedProjectId,
    setSearchQuery,
    selectProject: handleSelectProject,
    refresh,
    createProject
  };
}
