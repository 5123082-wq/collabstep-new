export type CsvExpenseRecord = {
  date: string;
  amount: string;
  currency: string;
  category?: string;
  description?: string;
  vendor?: string;
  project: string;
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

export function parseExpensesCsv(input: string): CsvExpenseRecord[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    return [];
  }

  const headerCells = splitCsvLine(lines[0]).map(normalizeHeader);
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
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const raw = lines[lineIndex];
    if (!raw.trim()) {
      continue;
    }
    const cells = splitCsvLine(raw).map((cell) => cell.trim());
    const get = (field: string) => {
      const idx = indexMap.get(field);
      if (idx === undefined) return '';
      return cells[idx] ?? '';
    };
    const record: CsvExpenseRecord = {
      date: get('date'),
      amount: get('amount'),
      currency: get('currency'),
      category: get('category') || undefined,
      description: get('description') || undefined,
      vendor: get('vendor') || undefined,
      project: get('project')
    };
    if (!record.date && !record.amount && !record.project) {
      continue;
    }
    records.push(record);
  }

  return records;
}
