import { leftMenuConfig, type LeftMenuSection } from '@/components/app/LeftMenu.config';
import { filterRoles, type UserRole, canAccessMarketplace, canAccessMarketing, getUserRoles } from '@/lib/auth/roles';

type BuiltMenuSection = LeftMenuSection & { children?: LeftMenuSection['children'] };

export function buildLeftMenu(roles: UserRole[]): BuiltMenuSection[] {
  // Используем getUserRoles() для получения ролей с учётом типа пользователя
  const currentRoles = getUserRoles();
  
  return leftMenuConfig
    .filter((section) => {
      // Специальная логика для секций marketplace и performers
      if (section.id === 'marketplace' || section.id === 'performers') {
        return canAccessMarketplace(currentRoles);
      }
      
      // Специальная логика для секции marketing
      if (section.id === 'marketing') {
        return canAccessMarketing();
      }
      
      // Стандартная фильтрация по ролям
      if (!section.roles?.length) {
        return true;
      }

      return section.roles.some((role) => currentRoles.includes(role));
    })
    .map((section) => {
      const children = section.children ? filterRoles(section.children, currentRoles) : [];
      return { ...section, children };
    });
}
