'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import projectsData from '@/app/mock/projects.json';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { ProjectProvider } from '@/components/project/ProjectContext';
import CreateMenu from '@/components/app/CreateMenu';
import CommandPalette from '@/components/app/CommandPalette';
import ToastHub from '@/components/app/ToastHub';
import { useUiStore } from '@/lib/state/ui-store';

type ProjectRecord = {
  id: string;
  name: string;
  stage: string;
  visibility: 'private' | 'public';
};

const fallbackProject = (id: string): ProjectRecord => ({
  id,
  name: `Проект ${id}`,
  stage: 'Идея',
  visibility: 'private'
});

type ProjectLayoutProps = {
  children: ReactNode;
  params: { id: string };
};

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const pathname = usePathname();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const setLastProjectId = useUiStore((state) => state.setLastProjectId);

  const project = useMemo(() => {
    const list = projectsData as ProjectRecord[];
    return list.find((item) => item.id === params.id) ?? fallbackProject(params.id);
  }, [params.id]);

  useEffect(() => {
    setLastProjectId(project.id);
  }, [project.id, setLastProjectId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setCreateOpen(false);
        setPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const contextValue = useMemo(
    () => ({
      projectId: project.id,
      projectName: project.name,
      stage: project.stage,
      visibility: project.visibility
    }),
    [project.id, project.name, project.stage, project.visibility]
  );

  return (
    <ProjectProvider value={contextValue}>
      <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
        <ProjectSidebar projectId={project.id} />
        <div className="flex min-h-screen flex-1 flex-col">
          <ProjectHeader
            name={project.name}
            stage={project.stage}
            visibility={project.visibility}
            onOpenCreate={() => setCreateOpen(true)}
          />
          <main className="flex-1 overflow-y-auto bg-neutral-950/80">
            <div
              className="project-content mx-auto w-full max-w-6xl px-6 py-8"
              data-testid="project-content"
              key={pathname}
            >
              {children}
            </div>
          </main>
        </div>
        <CreateMenu open={isCreateOpen} onClose={() => setCreateOpen(false)} />
        <CommandPalette open={isPaletteOpen} onClose={() => setPaletteOpen(false)} />
        <ToastHub />
      </div>
    </ProjectProvider>
  );
}
