import type { FinanceRole } from '@/domain/finance/expenses';

export type ExpensePermissions = {
  canCreate: boolean;
  canImport: boolean;
  canExport: boolean;
  canEdit: boolean;
  canManageAttachments: boolean;
  canChangeStatus: boolean;
};

const PERMISSIONS: Record<FinanceRole, ExpensePermissions> = {
  viewer: {
    canCreate: false,
    canImport: false,
    canExport: true,
    canEdit: false,
    canManageAttachments: false,
    canChangeStatus: false
  },
  member: {
    canCreate: true,
    canImport: false,
    canExport: true,
    canEdit: true,
    canManageAttachments: true,
    canChangeStatus: false
  },
  admin: {
    canCreate: true,
    canImport: true,
    canExport: true,
    canEdit: true,
    canManageAttachments: true,
    canChangeStatus: true
  },
  owner: {
    canCreate: true,
    canImport: true,
    canExport: true,
    canEdit: true,
    canManageAttachments: true,
    canChangeStatus: true
  }
};

export function getExpensePermissions(role: FinanceRole): ExpensePermissions {
  return PERMISSIONS[role];
}

export function mergeExpensePermissions(
  base: ExpensePermissions,
  overrides?: Partial<ExpensePermissions>
): ExpensePermissions {
  if (!overrides) {
    return base;
  }
  return { ...base, ...overrides } satisfies ExpensePermissions;
}
