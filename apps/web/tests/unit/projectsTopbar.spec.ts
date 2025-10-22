import { isActivePath, TOPBAR_LINKS } from '@/components/projects/projectsTopbar.config';

describe('ProjectsTopbar navigation', () => {
  it('подсвечивает «Обзор» только на корневом маршруте', () => {
    const overviewLink = TOPBAR_LINKS.find((link) => link.id === 'overview');
    expect(overviewLink).toBeDefined();
    expect(isActivePath('/app/projects', overviewLink!)).toBe(true);
    expect(isActivePath('/app/projects/my', overviewLink!)).toBe(false);
  });

  it('подсвечивает соответствующие вкладки при вложенных маршрутах', () => {
    const myLink = TOPBAR_LINKS.find((link) => link.id === 'my');
    const templatesLink = TOPBAR_LINKS.find((link) => link.id === 'templates');
    expect(myLink).toBeDefined();
    expect(templatesLink).toBeDefined();

    expect(isActivePath('/app/projects/my', myLink!)).toBe(true);
    expect(isActivePath('/app/projects/my/board', myLink!)).toBe(true);
    expect(isActivePath('/app/projects/templates', myLink!)).toBe(false);

    expect(isActivePath('/app/projects/templates', templatesLink!)).toBe(true);
    expect(isActivePath('/app/projects/templates/library', templatesLink!)).toBe(true);
  });

  it('не подсвечивает вкладки, если путь пустой', () => {
    const archiveLink = TOPBAR_LINKS.find((link) => link.id === 'archive');
    expect(archiveLink).toBeDefined();
    expect(isActivePath('', archiveLink!)).toBe(false);
    expect(isActivePath(null, archiveLink!)).toBe(false);
  });
});
