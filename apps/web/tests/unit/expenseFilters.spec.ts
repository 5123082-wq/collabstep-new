import { buildExpenseFilterParams, parseExpenseFilters } from '@/lib/finance/filters';

describe('expense filters utils', () => {
  it('parses filters with defaults', () => {
    const params = new URLSearchParams({
      projectId: 'proj-1',
      status: 'approved',
      category: 'Маркетинг',
      vendor: 'Agency',
      q: 'design',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      page: '3',
      pageSize: '50'
    });
    const filters = parseExpenseFilters(params);
    expect(filters).toEqual({
      projectId: 'proj-1',
      status: 'approved',
      category: 'Маркетинг',
      vendor: 'Agency',
      q: 'design',
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      page: 3,
      pageSize: 50
    });
  });

  it('builds params removing empty values', () => {
    const current = new URLSearchParams({ projectId: 'proj-1', status: 'draft', page: '2', pageSize: '20' });
    const next = buildExpenseFilterParams(current, { projectId: '', status: 'approved', page: 1 });
    expect(next.get('projectId')).toBeNull();
    expect(next.get('status')).toBe('approved');
    expect(next.get('page')).toBe('1');
    expect(next.get('pageSize')).toBe('20');
  });
});
