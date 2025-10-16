import { getProjectMenuForRoles } from '@/components/project/ProjectMenu.config';
import type { UserRole } from '@/lib/auth/roles';

describe('project menu role gating', () => {
  const extractSlugs = (roles: UserRole[]) => getProjectMenuForRoles(roles).map((item) => item.slug);

  it('скрывает финансы и настройки для ролей без доступа', () => {
    const slugs = extractSlugs(['SPECIALIST']);
    expect(slugs).not.toContain('finance');
    expect(slugs).not.toContain('settings');
  });

  it('показывает финансы и настройки для основателя', () => {
    const slugs = extractSlugs(['FOUNDER']);
    expect(slugs).toContain('finance');
    expect(slugs).toContain('settings');
  });

  it('показывает доступ к подрядчикам для подрядчиков и менеджеров', () => {
    const contractorSlugs = extractSlugs(['CONTRACTOR']);
    expect(contractorSlugs).toContain('contractors');
    expect(contractorSlugs).not.toContain('finance');

    const pmSlugs = extractSlugs(['PM']);
    expect(pmSlugs).toContain('contractors');
    expect(pmSlugs).toContain('finance');
    expect(pmSlugs).toContain('settings');
  });
});
