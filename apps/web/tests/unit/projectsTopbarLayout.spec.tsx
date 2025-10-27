/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    setMatchMediaMatches('(min-width: 768px)', false);
  });

  it('отображает бургер-меню и скрывает навигацию в шторку на мобильных экранах', async () => {
    render(<ProjectsTopbar />);

    const layout = screen.getByTestId('projects-topbar-layout');
    expect(layout).toHaveAttribute('data-layout-mode', 'mobile');

    expect(screen.queryByTestId('projects-topbar-nav')).not.toBeInTheDocument();

    const trigger = screen.getByTestId('projects-topbar-menu-trigger');
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);

    const sheetNav = await waitFor(() => screen.getByTestId('projects-topbar-sheet-nav'));
    const links = sheetNav.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link.className).toContain('projects-topbar__sheet-link');
    });

    const filters = screen.getByTestId('projects-topbar-filters');
    expect(filters.className).toContain('layout-inline-scroll');
  });

  it('переключает компоненты в десктопную сетку при широкой вьюпорте', async () => {
    setMatchMediaMatches('(min-width: 768px)', true);
    setMatchMediaMatches('(min-width: 1024px)', true);
    render(<ProjectsTopbar />);

    const layout = await waitFor(() => screen.getByTestId('projects-topbar-layout'));
    await waitFor(() => {
      expect(layout).toHaveAttribute('data-layout-mode', 'desktop');
    });

    expect(screen.queryByTestId('projects-topbar-menu-trigger')).not.toBeInTheDocument();

    const nav = await waitFor(() => screen.getByTestId('projects-topbar-nav'));
    expect(nav.className).toContain('layout-inline-scroll');
    nav.querySelectorAll('a').forEach((link) => {
      expect(link.className).toContain('projects-topbar__link');
    });

    const tools = screen.getByTestId('projects-topbar-tools');
    await waitFor(() => {
      expect(tools).toHaveAttribute('data-layout-mode', 'desktop');
    });
  });
});
