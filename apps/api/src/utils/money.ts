const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export function normalizeAmount(value: unknown): string {
  let input: string;
  if (typeof value === 'number' && Number.isFinite(value)) {
    input = value.toFixed(2);
  } else {
    input = String(value ?? '').trim();
  }

  if (!AMOUNT_PATTERN.test(input)) {
    throw new Error('INVALID_AMOUNT');
  }

  const [integerPart, decimalPart = ''] = input.split('.');
  const normalizedDecimals = `${decimalPart}00`.slice(0, 2);
  return `${integerPart}.${normalizedDecimals}`;
}

export function normalizeCurrency(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('INVALID_CURRENCY');
  }
  const normalized = value.trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(normalized)) {
    throw new Error('INVALID_CURRENCY');
  }
  return normalized;
}

export function amountToCents(amount: string): bigint {
  const [integerPartRaw = '0', decimalPartRaw = ''] = amount.split('.');
  const integerPart = integerPartRaw || '0';
  const decimalPart = decimalPartRaw || '';
  const normalizedDecimals = `${decimalPart}00`.slice(0, 2);
  return BigInt(integerPart) * 100n + BigInt(normalizedDecimals);
}

export function centsToAmount(value: bigint): string {
  const isNegative = value < 0n;
  const absolute = isNegative ? -value : value;
  const integerPart = absolute / 100n;
  const decimalPart = absolute % 100n;
  const result = `${integerPart}.${decimalPart.toString().padStart(2, '0')}`;
  return isNegative ? `-${result}` : result;
}
