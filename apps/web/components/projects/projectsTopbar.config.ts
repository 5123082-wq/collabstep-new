export type ProjectsTopbarLink = {
  id: string;
  label: string;
  href: string;
  exact?: boolean;
};

export const TOPBAR_LINKS: ProjectsTopbarLink[] = [
  { id: 'overview', label: 'Обзор', href: '/app/projects', exact: true },
  { id: 'my', label: 'Мои', href: '/app/projects/my' },
  { id: 'templates', label: 'Шаблоны', href: '/app/projects/templates' },
  { id: 'archive', label: 'Архив', href: '/app/projects/archive' },
  { id: 'create', label: 'Создать', href: '/app/projects/create' },
  { id: 'workspace', label: 'Рабочее пространство', href: '/app/projects/workspace' }
];

export function isActivePath(pathname: string | null, link: ProjectsTopbarLink) {
  if (!pathname) {
    return false;
  }
  if (link.exact) {
    return pathname === link.href;
  }
  return pathname.startsWith(link.href);
}
