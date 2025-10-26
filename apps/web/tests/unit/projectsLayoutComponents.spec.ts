import fs from 'node:fs';
import path from 'node:path';

describe('Projects layout components wiring', () => {
  const read = (relativePath: string) =>
    fs.readFileSync(path.resolve(__dirname, '../../components', relativePath), 'utf8');

  it('подключает адаптивные классы в ProjectsTopbar', () => {
    const content = read('projects/ProjectsTopbar.tsx');
    expect(content).toContain('PROJECTS_TOPBAR_CLASSNAMES.nav');
    expect(content).toContain('PROJECTS_TOPBAR_CLASSNAMES.link');
  });

  it('использует адаптивные меню-классы в SectionHeader', () => {
    const content = read('common/SectionHeader.tsx');
    expect(content).toContain('SECTION_MENU_CLASSNAMES.link');
    expect(content).toContain('SECTION_MENU_CLASSNAMES.list');
  });

  it('применяет общий shell в ProjectsLayoutShell', () => {
    const content = read('projects/ProjectsLayoutShell.tsx');
    expect(content).toContain('DashboardSplitLayout');
    const layoutShell = read('common/DashboardSplitLayout.tsx');
    expect(layoutShell).toContain("DASHBOARD_SHELL_CLASSNAMES.root");
  });

  it('подключает сетку фильтров и каталога', () => {
    const filtersContent = read('projects/ProjectCatalogFilters.tsx');
    expect(filtersContent).toContain('PROJECTS_LAYOUT_CLASSNAMES.filters');

    const screenContent = read('projects/ProjectIndexPageScreen.tsx');
    expect(screenContent).toContain('PROJECTS_LAYOUT_CLASSNAMES.catalogGrid');
  });
});
