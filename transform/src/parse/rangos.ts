import { readCsv, toNumber } from './csv-utils.js';

export interface RangoDescriptivoRecord {
  code: string;
  id: string;
  NMun: string;
  q1: number | null;
  medio: number | null;
  q3: number | null;
}

export function parseRangosDescriptivos(inputDir: string): RangoDescriptivoRecord[] {
  const rows = readCsv(inputDir, 'rangos_descriptivos.csv');
  return rows.map(row => ({
    code: row.code,
    id: row.id,
    NMun: row.NMun,
    q1: toNumber(row['1Q']),
    medio: toNumber(row['MEDIO']),
    q3: toNumber(row['3Q']),
  }));
}
