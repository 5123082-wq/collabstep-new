import { NextResponse } from 'next/server';
import { adminService } from '@collabverse/api';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

export async function GET() {
  const session = getDemoSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const items = adminService.listUsers();
  return NextResponse.json({ items });
}

