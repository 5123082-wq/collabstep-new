import { buildLeftMenu } from '@/lib/nav/menu-builder';
import type { UserRole } from '@/lib/auth/roles';

describe('menu-builder', () => {
  it('скрывает админку для неадминистраторов', () => {
    const roles: UserRole[] = ['FOUNDER'];
    const menu = buildLeftMenu(roles);
    const hasAdmin = menu.some((section) => section.id === 'admin');
    expect(hasAdmin).toBe(false);
  });

  it('отображает админку для роли ADMIN', () => {
    const menu = buildLeftMenu(['ADMIN']);
    const hasAdmin = menu.some((section) => section.id === 'admin');
    expect(hasAdmin).toBe(true);
  });

  it('скрывает финансы для наблюдателя', () => {
    const menu = buildLeftMenu(['OBSERVER']);
    const hasFinance = menu.some((section) => section.id === 'finance');
    expect(hasFinance).toBe(false);
  });

  it('показывает финансы руководителю проекта', () => {
    const menu = buildLeftMenu(['PM']);
    const hasFinance = menu.some((section) => section.id === 'finance');
    expect(hasFinance).toBe(true);
  });
});
