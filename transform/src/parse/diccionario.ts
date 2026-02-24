import { readCsv, toNullable } from './csv-utils.js';

export interface DiccionarioRecord {
  agenda: string;
  nivel: number;
  dimension: string;
  nombre: string | null;
  detalle: string | null;
  logo: string | null;
}

export function parseDiccionario(inputDir: string): DiccionarioRecord[] {
  const rows = readCsv(inputDir, 'diccionario.csv');
  return rows.map(row => ({
    agenda: row.agenda,
    nivel: Number(row.nivel),
    dimension: String(row.dimension),
    nombre: toNullable(row.nombre),
    detalle: toNullable(row.detalle),
    logo: toNullable(row.logo),
  }));
}
