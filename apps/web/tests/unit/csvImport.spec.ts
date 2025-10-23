import { parseExpensesCsv } from '@/lib/finance/csv-import';

describe('parseExpensesCsv', () => {
  it('parses basic csv', () => {
    const csv = `Date,Amount,Currency,Category,Description,Vendor,Project\n2024-01-01,1000,RUB,Маркетинг,Кампания,Agency,proj-1`;
    const rows = parseExpensesCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      date: '2024-01-01',
      amount: '1000',
      currency: 'RUB',
      category: 'Маркетинг',
      description: 'Кампания',
      vendor: 'Agency',
      project: 'proj-1'
    });
  });

  it('supports quoted values and project name header', () => {
    const csv = `Date,Amount,Currency,Category,Description,Vendor,Project(name|id)\n2024-02-15,"1,500",USD,"R&D","Прототип, этап 1","Lab","Prototype"`;
    const rows = parseExpensesCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      date: '2024-02-15',
      amount: '1,500',
      currency: 'USD',
      category: 'R&D',
      description: 'Прототип, этап 1',
      vendor: 'Lab',
      project: 'Prototype'
    });
  });

  it('throws when required columns are missing', () => {
    expect(() => parseExpensesCsv('Date,Amount\n2024-01-01,100')).toThrow('CSV_HEADER_MISSING_CURRENCY_PROJECT');
  });
});
