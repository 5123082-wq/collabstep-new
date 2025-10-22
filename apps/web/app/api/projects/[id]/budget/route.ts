import { financeService } from '@collabverse/api';
import { jsonError, jsonOk } from '@/lib/api/http';
import { assertProjectAccess, getAuthFromRequest, getProjectRole } from '@/lib/api/finance-access';

function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  switch (message) {
    case 'INVALID_AMOUNT':
    case 'INVALID_CURRENCY':
    case 'AMOUNT_NOT_POSITIVE':
    case 'INVALID_WARN_THRESHOLD':
      return jsonError(message, { status: 400 });
    default:
      console.error('Finance budget error', error);
      return jsonError('INTERNAL_ERROR', { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return jsonError('UNAUTHORIZED', { status: 401 });
  }

  const role = getProjectRole(params.id, auth.userId);
  if (role === 'viewer' || role === 'member') {
    return jsonError('FORBIDDEN', { status: 403 });
  }

  const budget = financeService.getBudget(params.id);
  if (!budget) {
    return jsonOk(null, { status: 200 });
  }

  return jsonOk(budget);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return jsonError('UNAUTHORIZED', { status: 401 });
  }

  const role = getProjectRole(params.id, auth.userId);
  try {
    assertProjectAccess(role, ['owner', 'admin']);
  } catch (error) {
    return jsonError('FORBIDDEN', { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonError('INVALID_BODY', { status: 400 });
  }

  try {
    const budget = financeService.upsertBudget(
      params.id,
      {
        currency: body.currency,
        total: body.total,
        warnThreshold: body.warnThreshold,
        categories: Array.isArray(body.categories)
          ? body.categories.map((category: any) => ({
              name: String(category?.name ?? ''),
              limit: category?.limit
            }))
          : undefined
      },
      { actorId: auth.userId }
    );

    return jsonOk(budget);
  } catch (error) {
    return handleError(error);
  }
}
