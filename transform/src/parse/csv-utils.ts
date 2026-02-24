import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse/sync';

export function readCsv<T extends Record<string, string>>(dir: string, filename: string): T[] {
  const content = readFileSync(join(dir, filename), 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

export function toNullable(val: string | undefined): string | null {
  return val === undefined || val === '' ? null : val;
}

export function toNumber(val: string | undefined): number | null {
  if (val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export function parseSemicolonList(val: string | undefined): string[] {
  if (!val || val.trim() === '') return [];
  return val.split(';').map(s => s.trim()).filter(s => s !== '');
}
