import { formatMoney, parseAmountInput } from '@/lib/finance/format-money';

describe('formatMoney', () => {
  it('formats values with locale currency', () => {
    const formatted = formatMoney('1234.5', 'RUB', 'ru-RU');
    expect(formatted).toBe('1 234,50 ₽');
  });

  it('falls back to plain string when currency is invalid', () => {
    const formatted = formatMoney('99.9', 'XXX', 'ru-RU');
    expect(formatted).toBe('99,90 XXXX');
  });
});

describe('parseAmountInput', () => {
  it('normalizes numbers with spaces and comma', () => {
    expect(parseAmountInput(' 1 234,56 ')).toBe('1234.56');
  });

  it('returns zero for invalid input', () => {
    expect(parseAmountInput('не число')).toBe('0');
  });
});
