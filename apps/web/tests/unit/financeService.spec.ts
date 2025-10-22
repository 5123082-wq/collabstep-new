import { financeService, projectsRepository, resetFinanceMemory } from '@collabverse/api';

describe('financeService', () => {
  const projectId = projectsRepository.list()[0]?.id ?? 'proj-admin-onboarding';

  beforeEach(() => {
    resetFinanceMemory();
    financeService.upsertBudget(
      projectId,
      {
        currency: 'USD',
        total: '1000',
        warnThreshold: 0.5,
        categories: [{ name: 'Design', limit: '600' }]
      },
      { actorId: 'admin.demo@collabverse.test' }
    );
  });

  it('validates currency when creating expenses', () => {
    expect(() =>
      financeService.createExpense(
        {
          workspaceId: 'workspace',
          projectId,
          date: new Date().toISOString(),
          amount: '100',
          currency: 'US',
          category: 'Design'
        },
        { actorId: 'admin.demo@collabverse.test' }
      )
    ).toThrow('INVALID_CURRENCY');
  });

  it('prevents skipping status transitions', () => {
    const expense = financeService.createExpense(
      {
        workspaceId: 'workspace',
        projectId,
        date: new Date().toISOString(),
        amount: '100',
        currency: 'USD',
        category: 'Design'
      },
      { actorId: 'admin.demo@collabverse.test' }
    );

    expect(() =>
      financeService.updateExpense(
        expense.id,
        {
          status: 'approved'
        },
        { actorId: 'admin.demo@collabverse.test' }
      )
    ).toThrow('INVALID_STATUS_TRANSITION');
  });

  it('recalculates budget usage for approved expenses', () => {
    const expense = financeService.createExpense(
      {
        workspaceId: 'workspace',
        projectId,
        date: new Date().toISOString(),
        amount: '250',
        currency: 'USD',
        category: 'Design'
      },
      { actorId: 'admin.demo@collabverse.test' }
    );

    financeService.updateExpense(
      expense.id,
      { status: 'pending' },
      { actorId: 'admin.demo@collabverse.test' }
    );
    financeService.updateExpense(
      expense.id,
      { status: 'approved' },
      { actorId: 'admin.demo@collabverse.test' }
    );

    const budget = financeService.getBudget(projectId);
    expect(budget?.spentTotal).toBe('250.00');
    const design = budget?.categoriesUsage.find((item) => item.name === 'Design');
    expect(design?.spent).toBe('250.00');
  });
});
