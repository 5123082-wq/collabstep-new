import type { DemoRole } from '@/lib/auth/demo-session';
import { isDemoAdminEmail } from '@/lib/auth/demo-session';

export type UserRole =
  | 'FOUNDER'
  | 'SPECIALIST'
  | 'CONTRACTOR'
  | 'PM'
  | 'ADMIN'
  | 'MODERATOR'
  | 'OBSERVER';

const DEFAULT_ROLES: UserRole[] = ['FOUNDER', 'PM'];
const FULL_ADMIN_ROLES: UserRole[] = ['FOUNDER', 'PM', 'ADMIN', 'MODERATOR', 'SPECIALIST', 'CONTRACTOR', 'OBSERVER'];

function uniqueRoles(roles: UserRole[]): UserRole[] {
  return [...new Set(roles)];
}

const FINANCE_ALLOWED = new Set<UserRole>(['FOUNDER', 'PM', 'ADMIN']);
const ADMIN_ALLOWED = new Set<UserRole>(['ADMIN', 'MODERATOR']);

export function getUserRoles(): UserRole[] {
  if (typeof window !== 'undefined') {
    const persisted = window.localStorage.getItem('cv-roles');
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted) as UserRole[];
        if (Array.isArray(parsed) && parsed.every((role) => typeof role === 'string')) {
          return parsed as UserRole[];
        }
      } catch (error) {
        console.warn('Не удалось разобрать роли из localStorage', error);
      }
    }
  }

  return DEFAULT_ROLES;
}

export function setUserRoles(roles: UserRole[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cv-roles', JSON.stringify(roles));
  }
}

export function getRolesForDemoRole(role: DemoRole): UserRole[] {
  if (role === 'admin') {
    return uniqueRoles(FULL_ADMIN_ROLES);
  }

  return uniqueRoles(DEFAULT_ROLES);
}

export function getRolesForDemoAccount(email: string | null | undefined, role: DemoRole): UserRole[] {
  if (isDemoAdminEmail(email)) {
    return uniqueRoles(FULL_ADMIN_ROLES);
  }

  return getRolesForDemoRole(role);
}

export function canAccessFinance(roles: UserRole[]): boolean {
  return roles.some((role) => FINANCE_ALLOWED.has(role));
}

export function canAccessAdmin(roles: UserRole[]): boolean {
  return roles.some((role) => ADMIN_ALLOWED.has(role));
}

export function filterRoles<T extends { roles?: UserRole[] }>(items: T[], roles: UserRole[]): T[] {
  return items.filter((item) => {
    if (!item.roles?.length) {
      return true;
    }

    return item.roles.some((role) => roles.includes(role));
  });
}
