import type { ReactNode } from 'react';
import ProjectsLayoutShell from '@/components/projects/ProjectsLayoutShell';

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <ProjectsLayoutShell>{children}</ProjectsLayoutShell>;
}
