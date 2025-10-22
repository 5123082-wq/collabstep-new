export const financeOpenApi = {
  openapi: '3.1.0',
  info: {
    title: 'Collabstep Finance API',
    version: '0.1.0'
  },
  paths: {
    '/api/expenses': {
      post: {
        summary: 'Create expense',
        operationId: 'createExpense',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['workspaceId', 'projectId', 'date', 'amount', 'currency', 'category'],
                properties: {
                  workspaceId: { type: 'string' },
                  projectId: { type: 'string' },
                  taskId: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  amount: { type: 'string', pattern: '^\\d+(?:\\.\\d{2})?$' },
                  currency: { type: 'string', minLength: 3, maxLength: 3 },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  vendor: { type: 'string' },
                  paymentMethod: { type: 'string' },
                  taxAmount: { type: 'string' },
                  status: { type: 'string', enum: ['draft', 'pending', 'approved', 'payable', 'closed'] }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Expense created'
          },
          '400': { description: 'Validation error' }
        }
      },
      get: {
        summary: 'List expenses',
        operationId: 'listExpenses',
        parameters: [
          { name: 'projectId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } }
        ],
        responses: {
          '200': { description: 'List of expenses' }
        }
      }
    },
    '/api/expenses/{id}': {
      patch: {
        summary: 'Update expense',
        operationId: 'updateExpense',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Expense updated' },
          '400': { description: 'Validation error' },
          '404': { description: 'Not found' }
        }
      }
    },
    '/api/projects/{projectId}/expenses': {
      get: {
        summary: 'List project expenses',
        operationId: 'listProjectExpenses',
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'q', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Project expenses' }
        }
      }
    },
    '/api/projects/{projectId}/budget': {
      get: {
        summary: 'Get project budget',
        operationId: 'getProjectBudget',
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Project budget snapshot' }
        }
      },
      put: {
        summary: 'Update project budget',
        operationId: 'updateProjectBudget',
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currency'],
                properties: {
                  currency: { type: 'string', minLength: 3, maxLength: 3 },
                  total: { type: 'string' },
                  warnThreshold: { type: 'number', minimum: 0, maximum: 1 },
                  categories: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['name'],
                      properties: {
                        name: { type: 'string' },
                        limit: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Budget updated' },
          '400': { description: 'Validation error' }
        }
      }
    }
  }
};
