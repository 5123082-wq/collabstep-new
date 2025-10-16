'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ProjectContextValue = {
  projectId: string;
  projectName: string;
  stage: string;
  visibility: 'private' | 'public';
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ value, children }: { value: ProjectContextValue; children: ReactNode }) {
  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): ProjectContextValue | null {
  return useContext(ProjectContext);
}
