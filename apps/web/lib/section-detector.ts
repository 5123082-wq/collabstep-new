/**
 * Утилита для определения текущего глобального раздела по pathname
 */

export type GlobalSectionId =
  | 'dashboard'
  | 'projects'
  | 'marketplace'
  | 'performers'
  | 'marketing'
  | 'ai-hub'
  | 'community'
  | 'finance'
  | 'docs'
  | 'org'
  | 'support'
  | 'admin';

/**
 * Определяет глобальный раздел на основе pathname
 */
export function detectSectionFromPath(pathname: string): GlobalSectionId | null {
  if (!pathname) {
    return null;
  }
  
  const normalized = pathname.split('?')[0] || ''; // Убираем query параметры
  
  if (normalized.startsWith('/app/dashboard') || normalized === '/app') {
    return 'dashboard';
  }
  if (normalized.startsWith('/app/projects') || normalized.startsWith('/project')) {
    return 'projects';
  }
  if (normalized.startsWith('/market')) {
    return 'marketplace';
  }
  if (normalized.startsWith('/app/performers')) {
    return 'performers';
  }
  if (normalized.startsWith('/app/marketing')) {
    return 'marketing';
  }
  if (normalized.startsWith('/app/ai-hub')) {
    return 'ai-hub';
  }
  if (normalized.startsWith('/app/community')) {
    return 'community';
  }
  if (normalized.startsWith('/app/finance')) {
    return 'finance';
  }
  if (normalized.startsWith('/app/docs')) {
    return 'docs';
  }
  if (normalized.startsWith('/app/org')) {
    return 'org';
  }
  if (normalized.startsWith('/app/support')) {
    return 'support';
  }
  if (normalized.startsWith('/app/admin')) {
    return 'admin';
  }
  
  return null;
}

