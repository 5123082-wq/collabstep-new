export type CsvExpenseRecord = {
  date: string;
  amount: string;
  currency: string;
  category?: string;
  description?: string;
  vendor?: string;
  project: string;
  rowNumber: number;
};

export type CsvParseError = { row: number; reason: string };

export type CsvParseResult = {
  records: CsvExpenseRecord[];
  errors: CsvParseError[];
  processed: number;
};

import { parseAmountInput } from './format-money';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeCsvDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (ISO_DATE_RE.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeCsvCurrency(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const upper = trimmed.toUpperCase();
  return /^[A-Z]{3}$/.test(upper) ? upper : null;
}

function normalizeCsvAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const compact = trimmed.replace(/\s+/g, '');
  const lastComma = compact.lastIndexOf(',');
  const lastDot = compact.lastIndexOf('.');
  const lastSeparator = Math.max(lastComma, lastDot);
  if (lastSeparator === -1) {
    const parsed = Number(compact);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parseAmountInput(compact);
  }
  const integerPartRaw = compact.slice(0, lastSeparator);
  const fractionalPartRaw = compact.slice(lastSeparator + 1);
  const integerDigits = integerPartRaw.replace(/[.,]/g, '');
  const fractionalDigits = fractionalPartRaw.replace(/[.,]/g, '');
  if (!/^-?\d*$/.test(integerDigits)) {
    return null;
  }
  if (!/^\d*$/.test(fractionalDigits)) {
    return null;
  }
  if (!fractionalDigits.length || fractionalDigits.length > 2) {
    const merged = `${integerDigits}${fractionalDigits}`;
    const parsed = Number(merged);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return parsed.toFixed(2);
  }
  const normalized = `${integerDigits}.${fractionalDigits}`;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed.toFixed(2);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function normalizeHeader(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower.startsWith('project')) {
    return 'project';
  }
  return lower;
}

const REQUIRED_FIELDS = ['date', 'amount', 'currency', 'project'] as const;

export function parseExpensesCsv(input: string): CsvParseResult {
  const lines = input.split(/\r?\n/);
  if (!lines.length) {
    return { records: [], errors: [], processed: 0 };
  }

  const headerLine = lines[0] ?? '';
  const headerCells = splitCsvLine(headerLine).map(normalizeHeader);
  const indexMap = new Map<string, number>();
  headerCells.forEach((cell, index) => {
    if (!indexMap.has(cell)) {
      indexMap.set(cell, index);
    }
  });

  const missing = REQUIRED_FIELDS.filter((field) => !indexMap.has(field));
  if (missing.length) {
    throw new Error(`CSV_HEADER_MISSING_${missing.join('_').toUpperCase()}`);
  }

  const records: CsvExpenseRecord[] = [];
  const errors: CsvParseError[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const raw = lines[lineIndex];
    const rowNumber = lineIndex + 1;
    if (!raw || !raw.trim()) {
      continue;
    }
    const cells = splitCsvLine(raw).map((cell) => cell.trim());
    const get = (field: string) => {
      const idx = indexMap.get(field);
      if (idx === undefined) {
        return '';
      }
      return cells[idx] ?? '';
    };

    const record = {
      date: get('date').trim(),
      amount: get('amount').trim(),
      currency: get('currency').trim(),
      category: get('category').trim(),
      description: get('description').trim(),
      vendor: get('vendor').trim(),
      project: get('project').trim()
    };

    if (!record.date && !record.amount && !record.project) {
      continue;
    }

    const missingFields = REQUIRED_FIELDS.filter((field) => !record[field as keyof typeof record]);
    if (missingFields.length) {
      errors.push({ row: rowNumber, reason: `Missing ${missingFields.join(', ')}` });
      continue;
    }

    const normalizedDate = normalizeCsvDate(record.date);
    if (!normalizedDate) {
      errors.push({ row: rowNumber, reason: 'Некорректная дата' });
      continue;
    }

    const normalizedAmount = normalizeCsvAmount(record.amount);
    if (!normalizedAmount) {
      errors.push({ row: rowNumber, reason: 'Некорректная сумма' });
      continue;
    }

    const normalizedCurrency = normalizeCsvCurrency(record.currency);
    if (!normalizedCurrency) {
      errors.push({ row: rowNumber, reason: 'Некорректная валюта' });
      continue;
    }

    const nextRecord: CsvExpenseRecord = {
      date: normalizedDate,
      amount: normalizedAmount,
      currency: normalizedCurrency,
      project: record.project,
      rowNumber
    };
    if (record.category) {
      nextRecord.category = record.category;
    }
    if (record.description) {
      nextRecord.description = record.description;
    }
    if (record.vendor) {
      nextRecord.vendor = record.vendor;
    }
    records.push(nextRecord);
  }

  return { records, errors, processed: records.length + errors.length };
}
