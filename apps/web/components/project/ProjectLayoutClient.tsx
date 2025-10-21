'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ProjectHeader from '@/components/project/ProjectHeader';
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { ProjectProvider } from '@/components/project/ProjectContext';
import { useAppShell } from '@/components/app/AppShellContext';
import { useUiStore } from '@/lib/state/ui-store';
import type { Project } from '@/lib/schemas/project';
import type { UserRole } from '@/lib/auth/roles';
import { getUserRoles } from '@/lib/auth/roles';
import { useQueryToast } from '@/lib/ui/useQueryToast';

type ProjectLayoutClientProps = {
  project: Project;
  children: ReactNode;
};

const TOAST_MESSAGES: Record<string, { message: string; tone?: 'info' | 'success' | 'warning' }> = {
  forbidden: { message: 'Недостаточно прав', tone: 'warning' }
};

export default function ProjectLayoutClient({ project, children }: ProjectLayoutClientProps) {
  const pathname = usePathname();
  const { openCreateMenu } = useAppShell();
  const setLastProjectId = useUiStore((state) => state.setLastProjectId);
  const [roles, setRoles] = useState<UserRole[]>(() => getUserRoles());
  useQueryToast(TOAST_MESSAGES);

  useEffect(() => {
    setLastProjectId(project.id);
  }, [project.id, setLastProjectId]);

  useEffect(() => {
    setRoles(getUserRoles());
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
      <div className="project-workspace grid gap-6 text-neutral-100 xl:grid-cols-[280px,minmax(0,1fr)]">
        <ProjectSidebar projectId={project.id} roles={roles} className="hidden xl:flex" />
        <div className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-950/70 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
          <ProjectHeader
            name={project.name}
            stage={project.stage}
            visibility={project.visibility}
            onOpenCreate={openCreateMenu}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <div
              className="project-content flex-1 overflow-y-auto px-6 py-8"
              data-testid="project-content"
              key={pathname}
            >
              {children}
            </div>
          </div>
        </div>
        <ProjectSidebar projectId={project.id} roles={roles} className="xl:hidden" />
      </div>
    </ProjectProvider>
  );
}
