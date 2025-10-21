import { buildLeftMenu } from '@/lib/nav/menu-builder';
import type { UserRole } from '@/lib/auth/roles';

const WORKSPACE_SECTIONS = [
  'overview',
  'tasks',
  'calendar',
  'team',
  'files',
  'analytics',
  'automations',
  'modules',
  'integrations',
  'settings'
];

describe('menu-builder', () => {
  it('возвращает основные разделы независимо от роли', () => {
    const roles: UserRole[] = ['OBSERVER'];
    const menu = buildLeftMenu(roles);
    const menuIds = menu.map((section) => section.id);

    WORKSPACE_SECTIONS.forEach((sectionId) => {
      expect(menuIds).toContain(sectionId);
    });
  });

  it('сохраняет вложенные ссылки для разделов', () => {
    const menu = buildLeftMenu(['FOUNDER']);
    const section = menu.find((item) => item.id === 'overview');

    expect(section?.children?.length).toBeGreaterThan(0);
    expect(section?.children?.every((child) => child.type === 'divider' || Boolean(child.href))).toBe(true);
  });
});
