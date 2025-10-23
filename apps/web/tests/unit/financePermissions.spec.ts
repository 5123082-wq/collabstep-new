import { formatAttachmentCount } from '@/domain/finance/expenses';
import { getExpensePermissions } from '@/lib/finance/permissions';

describe('formatAttachmentCount', () => {
  it('returns dash when attachments are missing', () => {
    expect(formatAttachmentCount(undefined)).toBe('—');
    expect(formatAttachmentCount([])).toBe('—');
  });

  it('returns count when attachments exist', () => {
    expect(formatAttachmentCount([{ filename: 'a', url: '#' }])).toBe('1 файл(ов)');
  });
});

describe('getExpensePermissions', () => {
  it('maps roles to permissions', () => {
    expect(getExpensePermissions('viewer')).toEqual({
      canCreate: false,
      canImport: false,
      canExport: true,
      canEdit: false,
      canManageAttachments: false,
      canChangeStatus: false
    });

    expect(getExpensePermissions('member')).toEqual({
      canCreate: true,
      canImport: true,
      canExport: true,
      canEdit: true,
      canManageAttachments: true,
      canChangeStatus: true
    });
  });
});
