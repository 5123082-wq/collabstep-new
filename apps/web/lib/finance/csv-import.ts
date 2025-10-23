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

    const nextRecord: CsvExpenseRecord = {
      date: record.date,
      amount: record.amount,
      currency: record.currency.toUpperCase(),
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
