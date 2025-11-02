import { NextResponse } from 'next/server';
import { projectCatalogService, DEFAULT_WORKSPACE_USER_ID } from '@collabverse/api';
import { flags } from '@/lib/flags';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

export async function GET() {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Get current user from session
  const session = getDemoSessionFromCookies();
  const currentUserId = session?.email ?? DEFAULT_WORKSPACE_USER_ID;

  const items = projectCatalogService.getProjects({ archived: false, currentUserId });
  return NextResponse.json({ items });
}
