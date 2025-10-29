import { decodeDemoSession, DEMO_SESSION_COOKIE, isDemoAdminEmail } from '@/lib/auth/demo-session';
import { projectsRepository } from '@collabverse/api';

export type FinanceRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface AuthContext {
  userId: string;
  email: string;
  role: FinanceRole;
}

export function getAuthFromRequest(request: Request): AuthContext | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split('=');
        return [key, rest.join('=')];
      })
  );

  const sessionCookie = cookies[DEMO_SESSION_COOKIE];
  if (!sessionCookie) {
    return null;
  }

  const session = decodeDemoSession(sessionCookie);
  if (!session) {
    return null;
  }

  const isAdmin = session.role === 'admin' || isDemoAdminEmail(session.email);

  return {
    userId: session.email,
    email: session.email,
    role: isAdmin ? 'owner' : 'member'
  };
}

export function getProjectRole(projectId: string, userId: string): FinanceRole {
  if (isDemoAdminEmail(userId)) {
    return 'owner';
  }

  const member = projectsRepository.getMember(projectId, userId);
  if (!member) {
    return 'viewer';
  }
  if (member.role === 'owner' || member.role === 'admin' || member.role === 'member') {
    return member.role;
  }
  return 'viewer';
}

export function assertProjectAccess(role: FinanceRole, allowed: FinanceRole[]): void {
  if (!allowed.includes(role)) {
    throw new Error('ACCESS_DENIED');
  }
}
