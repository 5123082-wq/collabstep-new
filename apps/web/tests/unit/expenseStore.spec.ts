import {
  DbExpenseStore,
  MemoryExpenseStore,
  type Expense,
  type ExpenseFilters,
  type ExpenseStatus,
  type ExpenseEntityRepository,
  type ExpenseIdempotencyRepository,
  resetFinanceMemory
} from '@collabverse/api';

describe('Expense stores smoke tests', () => {
  const baseExpense: Expense = {
    id: 'expense-1',
    workspaceId: 'workspace',
    projectId: 'project',
    date: new Date().toISOString(),
    amount: '100.00',
    currency: 'USD',
    category: 'Design',
    status: 'draft',
    createdBy: 'tester',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    resetFinanceMemory();
  });

  it('supports create/list/changeStatus/withIdempotency for MemoryExpenseStore', async () => {
    const store = new MemoryExpenseStore();
    const handler = jest.fn(() => store.create({ expense: { ...baseExpense }, actorId: 'tester' }));

    const created = await store.withIdempotency('key-1', handler);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(created.status).toBe('draft');

    const existing = await store.withIdempotency('key-1', async () => {
      throw new Error('should not be called for duplicate idempotency key');
    });
    expect(existing.id).toBe(created.id);

    const listed = await store.list({ projectId: baseExpense.projectId } satisfies ExpenseFilters);
    expect(listed).toHaveLength(1);

    const updated = await store.changeStatus(created.id, 'pending', { actorId: 'tester' });
    expect(updated?.status).toBe('pending');
  });

  it('supports create/list/changeStatus/withIdempotency for DbExpenseStore', async () => {
    const stored: Expense = { ...baseExpense };
    const approved: Expense = { ...stored, status: 'approved', updatedAt: new Date().toISOString() };

    const expensesRepo: ExpenseEntityRepository = {
      create: jest.fn(({ data }) => ({ ...data })),
      findById: jest.fn((id) => (id === stored.id ? { ...stored } : null)),
      list: jest.fn(() => [{ ...stored }]),
      update: jest.fn(() => ({ ...stored, vendor: 'Vendor' })),
      updateStatus: jest.fn(() => ({ ...approved })),
      aggregateByCategory: jest.fn(() => [])
    };

    const idempotencyMap = new Map<string, string>();
    const idempotencyRepo: ExpenseIdempotencyRepository = {
      get: (key) => idempotencyMap.get(key) ?? null,
      set: (key, value) => {
        idempotencyMap.set(key, value);
      }
    };

    const store = new DbExpenseStore({ expenses: expensesRepo, idempotency: idempotencyRepo });
    const handler = jest.fn(() => store.create({ expense: stored, actorId: 'tester' }));

    const created = await store.withIdempotency('db-key', handler);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(created.status).toBe('draft');

    expensesRepo.findById = jest.fn(() => ({ ...stored }));
    const duplicate = await store.withIdempotency('db-key', async () => {
      throw new Error('handler should be skipped for duplicate');
    });
    expect(duplicate.id).toBe(stored.id);

    const listed = await store.list({ projectId: stored.projectId });
    expect(listed).toHaveLength(1);
    expect(expensesRepo.list).toHaveBeenCalled();

    const status: ExpenseStatus = 'approved';
    const changed = await store.changeStatus(stored.id, status, { actorId: 'tester' });
    expect(changed?.status).toBe('approved');
    expect(expensesRepo.updateStatus).toHaveBeenCalledWith(stored.id, status);
  });
});
