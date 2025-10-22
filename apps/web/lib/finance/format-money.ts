export type FormatMoneyOptions = {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

function toNumber(value: string | number | bigint): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  const normalized = value.replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return 0;
}

export function formatMoney(
  amount: string | number | bigint,
  currency: string,
  locale: string = 'ru-RU',
  options: FormatMoneyOptions = {}
): string {
  const value = toNumber(amount);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits
    }).format(value);
  } catch (error) {
    return `${value.toFixed(2)} ${currency}`.trim();
  }
}

export function parseAmountInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '0';
  }
  const normalized = trimmed.replace(/\s+/g, '').replace(',', '.');
  const num = Number(normalized);
  if (!Number.isFinite(num)) {
    return '0';
  }
  return num.toFixed(2);
}
