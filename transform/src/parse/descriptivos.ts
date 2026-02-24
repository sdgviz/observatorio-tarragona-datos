import { readCsv, toNumber, toNullable } from './csv-utils.js';

export interface DescriptivoRecord {
  indicador: string;
  periodo: number;
  codigo_ine: string;
  valor: number | null;
  umbral: string | null;
}

export function parseDescriptivos(inputDir: string): DescriptivoRecord[] {
  const rows = readCsv(inputDir, 'descriptivos.csv');
  return rows.map(row => ({
    indicador: String(row.indicador),
    periodo: Number(row.periodo),
    codigo_ine: row.codigo_ine,
    valor: toNumber(row.valor),
    umbral: toNullable(row.umbral),
  }));
}
