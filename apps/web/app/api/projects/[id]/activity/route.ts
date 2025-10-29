import { NextRequest, NextResponse } from 'next/server';
import { auditLogRepository, type AuditLogFilters } from '@collabverse/api';
import { flags } from '@/lib/flags';

function parseDate(value: string | null, mode: 'start' | 'end'): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  if (!trimmed.includes('T')) {
    if (mode === 'start') {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }
  }
  return date.toISOString();
}

function normalizeActions(values: string[]): string[] {
  const seen = new Set<string>();
  for (const value of values) {
    const parts = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (!seen.has(part)) {
        seen.add(part);
      }
    }
  }
  return Array.from(seen);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!flags.PROJECT_ACTIVITY_AUDIT) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const search = req.nextUrl.searchParams;
  const entityTypeParam = search.get('entityType');
  const scope = search.get('scope');
  const entityIdParam = search.get('entityId');
  const from = parseDate(search.get('from'), 'start');
  const to = parseDate(search.get('to'), 'end');
  const actions = normalizeActions(search.getAll('action'));
  const limit = Number.parseInt(search.get('limit') ?? '', 10);

  const filters: AuditLogFilters = {
    projectId: params.id,
    ...(entityTypeParam ? { entityType: entityTypeParam } : {}),
    ...(entityIdParam ? { entityId: entityIdParam } : {}),
    ...(actions.length > 0 ? { actions } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {})
  };

  if (!filters.entityType && scope === 'tasks') {
    filters.entityType = 'task';
  }

  const items = auditLogRepository.list(filters);
  const sliced = Number.isFinite(limit) && limit > 0 ? items.slice(-limit) : items;
  const sorted = [...sliced].sort((a, b) => (a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0));

  return NextResponse.json({ items: sorted });
}
