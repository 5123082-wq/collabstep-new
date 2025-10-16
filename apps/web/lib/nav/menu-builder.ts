import { leftMenuConfig, type LeftMenuSection } from '@/components/app/LeftMenu.config';
import { filterRoles, type UserRole } from '@/lib/auth/roles';

type BuiltMenuSection = LeftMenuSection & { children?: LeftMenuSection['children'] };

export function buildLeftMenu(roles: UserRole[]): BuiltMenuSection[] {
  return leftMenuConfig
    .filter((section) => {
      if (!section.roles?.length) {
        return true;
      }

      return section.roles.some((role) => roles.includes(role));
    })
    .map((section) => {
      const children = section.children ? filterRoles(section.children, roles) : [];
      return { ...section, children };
    });
}
