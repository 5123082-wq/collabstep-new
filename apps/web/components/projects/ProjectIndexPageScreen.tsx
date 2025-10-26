'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import SectionHeader from '@/components/common/SectionHeader';
import SectionPageLayout from '@/components/common/SectionPageLayout';
import { PROJECT_SECTION_LAYOUT_VARS } from '@/components/common/sectionLayoutTokens';
import ProjectCatalogActions from './ProjectCatalogActions';
import ProjectCatalogFilters from './ProjectCatalogFilters';
import ProjectCatalogList from './ProjectCatalogList';

const ProjectDetailsPanel = dynamic(() => import('@/components/project/ProjectDetailsPanel'), {
  loading: () => (
    <section className="rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
      Загрузка сведений о проекте…
    </section>
  ),
  ssr: false
});

const ProjectActionsPanel = dynamic(() => import('@/components/project/ProjectActionsPanel'), {
  loading: () => (
    <section className="rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 text-sm text-neutral-400">
      Подготовка действий…
    </section>
  ),
  ssr: false
});

export default function ProjectIndexPageScreen() {
  const breadcrumbs = useMemo(
    () => [
      { label: 'Рабочее пространство', href: '/app' },
      { label: 'Проекты' }
    ],
    []
  );

  const menuItems = useMemo(
    () => [
      { label: 'Обзор', href: '/project', active: true },
      { label: 'Модули', href: '/project/modules' },
      { label: 'Создать', href: '/project/new' }
    ],
    []
  );

  return (
    <SectionPageLayout
      header={
        <SectionHeader
          title="Проекты"
          breadcrumbs={breadcrumbs}
          menuItems={menuItems}
          actions={<ProjectCatalogActions />}
        />
      }
      filters={<ProjectCatalogFilters />}
      main={<ProjectCatalogList />}
      secondary={
        <div className="space-y-6">
          <ProjectDetailsPanel />
          <ProjectActionsPanel />
        </div>
      }
      style={PROJECT_SECTION_LAYOUT_VARS}
    />
  );
}
