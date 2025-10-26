/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import ProjectsTopbar from '@/components/projects/ProjectsTopbar';
import { setMatchMediaMatches } from '../../../../jest.setup';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode; href: string; className?: string }) =>
    createElement('a', props, children)
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/app/projects'
}));

describe('ProjectsTopbar responsive layout', () => {
  beforeEach(() => {
    setMatchMediaMatches('(min-width: 1024px)', false);
  });

  it('располагает меню и фильтры в одну строку на мобильных экранах', () => {
    render(<ProjectsTopbar />);

    const layout = screen.getByTestId('projects-topbar-layout');
    expect(layout).toHaveAttribute('data-layout-mode', 'mobile');

    const nav = screen.getByTestId('projects-topbar-nav');
    expect(nav.className).toContain('layout-inline-scroll');
    nav.querySelectorAll('a').forEach((link) => {
      expect(link.className).toContain('projects-topbar__link');
    });

    const filters = screen.getByTestId('projects-topbar-filters');
    expect(filters.className).toContain('layout-inline-scroll');
  });

  it('переключает компоненты в десктопную сетку при широкой вьюпорте', async () => {
    setMatchMediaMatches('(min-width: 1024px)', true);
    render(<ProjectsTopbar />);

    const layout = await waitFor(() => screen.getByTestId('projects-topbar-layout'));
    await waitFor(() => {
      expect(layout).toHaveAttribute('data-layout-mode', 'desktop');
    });

    const tools = screen.getByTestId('projects-topbar-tools');
    await waitFor(() => {
      expect(tools).toHaveAttribute('data-layout-mode', 'desktop');
    });
  });
});
