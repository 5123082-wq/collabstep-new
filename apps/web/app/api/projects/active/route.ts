import { NextResponse } from 'next/server';
import { projectCatalogService } from '@collabverse/api';
import { flags } from '@/lib/flags';

export async function GET() {
  if (!flags.PROJECTS_V1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const items = projectCatalogService.getProjects({ archived: false });
  return NextResponse.json({ items });
}
