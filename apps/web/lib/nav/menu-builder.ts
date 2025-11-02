import { leftMenuConfig, type LeftMenuSection } from '@/components/app/LeftMenu.config';
import { filterRoles, type UserRole, getUserRoles } from '@/lib/auth/roles';
import { useMenuPreferencesStore } from '@/stores/menuPreferences';

type BuiltMenuSection = LeftMenuSection & { children?: LeftMenuSection['children'] };

export function buildLeftMenu(roles: UserRole[]): BuiltMenuSection[] {
  // Используем getUserRoles() для получения ролей с учётом типа пользователя
  const currentRoles = getUserRoles();
  
  // Получаем настройки видимости меню
  // В SSR контексте используем все меню по умолчанию
  let visibleMenuIds: string[] = [];
  if (typeof window !== 'undefined') {
    visibleMenuIds = useMenuPreferencesStore.getState().visibleMenuIds;
  } else {
    // В SSR контексте показываем все меню
    visibleMenuIds = leftMenuConfig.map((section) => section.id);
  }
  
  return leftMenuConfig
    .filter((section) => {
      // Проверяем видимость из настроек пользователя
      if (!visibleMenuIds.includes(section.id)) {
        return false;
      }
      
      // Стандартная фильтрация по ролям (для доступа к функционалу)
      // Важно: это НЕ блокирует доступ к страницам, только видимость в меню
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
