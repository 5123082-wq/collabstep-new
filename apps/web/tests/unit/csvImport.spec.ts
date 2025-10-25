import { parseExpensesCsv } from '@/lib/finance/csv-import';

describe('parseExpensesCsv', () => {
  it('parses basic csv', () => {
    const csv = `Date,Amount,Currency,Category,Description,Vendor,Project\n2024-01-01,1000,RUB,Маркетинг,Кампания,Agency,proj-1`;
    const result = parseExpensesCsv(csv);
    expect(result.processed).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toEqual({
      date: '2024-01-01',
      amount: '1000.00',
      currency: 'RUB',
      category: 'Маркетинг',
      description: 'Кампания',
      vendor: 'Agency',
      project: 'proj-1',
      rowNumber: 2
    });
  });

  it('supports quoted values and project name header', () => {
    const csv = `Date,Amount,Currency,Category,Description,Vendor,Project(name|id)\n2024-02-15,"1,500",USD,"R&D","Прототип, этап 1","Lab","Prototype"`;
    const result = parseExpensesCsv(csv);
    expect(result.processed).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toEqual({
      date: '2024-02-15',
      amount: '1500.00',
      currency: 'USD',
      category: 'R&D',
      description: 'Прототип, этап 1',
      vendor: 'Lab',
      project: 'Prototype',
      rowNumber: 2
    });
  });

  it('throws when required columns are missing', () => {
    expect(() => parseExpensesCsv('Date,Amount\n2024-01-01,100')).toThrow('CSV_HEADER_MISSING_CURRENCY_PROJECT');
  });

  it('returns validation errors for malformed rows', () => {
    const csv = `Date,Amount,Currency,Project\n2024-01-01,1000,RUB,proj-1\n2024-02-01,,USD,`;
    const result = parseExpensesCsv(csv);
    expect(result.processed).toBe(2);
    expect(result.records).toHaveLength(1);
    expect(result.errors).toEqual([{ row: 3, reason: expect.stringContaining('Missing') }]);
  });

  it('validates date, currency and amount formats', () => {
    const csv = `Date,Amount,Currency,Project\nnot-a-date,10,RUB,proj-1\n2024-02-01,abc,USD,proj-2\n2024-03-01,1000,XXXX,proj-3`;
    const result = parseExpensesCsv(csv);
    expect(result.records).toHaveLength(0);
    expect(result.errors).toEqual([
      { row: 2, reason: 'Некорректная дата' },
      { row: 3, reason: 'Некорректная сумма' },
      { row: 4, reason: 'Некорректная валюта' }
    ]);
  });
});
