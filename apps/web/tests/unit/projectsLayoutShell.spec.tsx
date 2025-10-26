/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import ProjectsLayoutShell from '@/components/projects/ProjectsLayoutShell';
import { setMatchMediaMatches } from '../../../../jest.setup';

jest.mock('@/components/projects/ProjectsTopbar', () => ({
  __esModule: true,
  default: () => createElement('div', { 'data-testid': 'mock-projects-topbar' })
}));

jest.mock('@/components/projects/SideDrawer', () => ({
  __esModule: true,
  default: () => createElement('div', { 'data-testid': 'mock-projects-drawer' })
}));

jest.mock('@/hooks/projects/useProjectDrawer', () => ({
  useProjectDrawer: () => ({
    isOpen: false,
    entityId: null,
    entityType: 'project',
    mode: 'view',
    closeDrawer: jest.fn(),
    getDrawerTitle: () => 'Проекты'
  })
}));

describe('ProjectsLayoutShell adaptive layout', () => {
  beforeEach(() => {
    setMatchMediaMatches('(min-width: 1280px)', false);
  });

  it('формирует мобильную колонку при узком экране', () => {
    render(
      <ProjectsLayoutShell>
        <div data-testid="projects-content">Контент</div>
      </ProjectsLayoutShell>
    );

    const layout = screen.getByTestId('projects-layout');
    expect(layout).toHaveAttribute('data-layout-mode', 'mobile');

    const content = screen.getByTestId('projects-layout-content');
    expect(content).toHaveAttribute('data-layout-mode', 'mobile');

    const aside = screen.getByTestId('projects-layout-aside');
    expect(aside.className).toContain('hidden');
  });

  it('включает десктопный режим при достаточной ширине', async () => {
    setMatchMediaMatches('(min-width: 1280px)', true);

    render(
      <ProjectsLayoutShell>
        <div data-testid="projects-content">Контент</div>
      </ProjectsLayoutShell>
    );

    const layout = screen.getByTestId('projects-layout');
    await waitFor(() => {
      expect(layout).toHaveAttribute('data-layout-mode', 'desktop');
    });

    const content = screen.getByTestId('projects-layout-content');
    await waitFor(() => {
      expect(content).toHaveAttribute('data-layout-mode', 'desktop');
    });

    const main = screen.getByTestId('projects-layout-main');
    expect(main).toHaveAttribute('aria-label', 'Проекты');

    const aside = screen.getByTestId('projects-layout-aside');
    expect(aside.className).toContain('xl:block');
  });
});
