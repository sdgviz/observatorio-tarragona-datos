import { readCsv, toNumber, toNullable } from './csv-utils.js';

export interface UmbralRecord {
  indicador: string;
  nombre: string | null;
  unidad: string | null;
  conteo: number | null;
  minimo: number | null;
  maximo: number | null;
  desv_tipica: number | null;
  percentil25: number | null;
  percentil75: number | null;
  percentil10: number | null;
  percentil90: number | null;
  origen: string | null;
  umbral_optimo: number | null;
  umbral_malo: number | null;
}

export function parseUmbrales(inputDir: string): UmbralRecord[] {
  const rows = readCsv(inputDir, 'umbrales.csv');
  return rows.map(row => ({
    indicador: String(row.indicador),
    nombre: toNullable(row.nombre),
    unidad: toNullable(row.unidad),
    conteo: toNumber(row.conteo),
    minimo: toNumber(row.minimo),
    maximo: toNumber(row.maximo),
    desv_tipica: toNumber(row.desv_tipica),
    percentil25: toNumber(row.percentil25),
    percentil75: toNumber(row.percentil75),
    percentil10: toNumber(row.percentil10),
    percentil90: toNumber(row.percentil90),
    origen: toNullable(row.origen),
    umbral_optimo: toNumber(row.umbral_optimo),
    umbral_malo: toNumber(row.umbral_malo),
  }));
}
