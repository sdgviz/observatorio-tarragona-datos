import { readCsv, toNumber } from './csv-utils.js';

export interface PromedioMetaOdsRecord {
  codigo_ine: string;
  meta_ods: string;
  promedio_indice: number | null;
  n_indicadores: number | null;
  periodo_max: number | null;
  ods_objetivo: string;
}

export interface PromedioObjetivoAueRecord {
  codigo_ine: string;
  objetivo_aue: string;
  promedio_indice: number | null;
  n_indicadores: number | null;
  periodo_max: number | null;
}

export interface PromedioOdsObjetivoRecord {
  codigo_ine: string;
  ods_objetivo: string;
  promedio_metas: number | null;
  n_metas: number | null;
}

export function parsePromediosMetaOds(inputDir: string): PromedioMetaOdsRecord[] {
  const rows = readCsv(inputDir, 'promedios_municipio_meta_ods.csv');
  return rows.map(row => ({
    codigo_ine: row.codigo_ine,
    meta_ods: String(row.meta_ods),
    promedio_indice: toNumber(row.promedio_indice),
    n_indicadores: toNumber(row.n_indicadores),
    periodo_max: toNumber(row.periodo_max),
    ods_objetivo: String(row.ods_objetivo),
  }));
}

export function parsePromediosObjetivoAue(inputDir: string): PromedioObjetivoAueRecord[] {
  const rows = readCsv(inputDir, 'promedios_municipio_objetivo_aue.csv');
  return rows.map(row => ({
    codigo_ine: row.codigo_ine,
    objetivo_aue: String(row.objetivo_aue),
    promedio_indice: toNumber(row.promedio_indice),
    n_indicadores: toNumber(row.n_indicadores),
    periodo_max: toNumber(row.periodo_max),
  }));
}

export function parsePromediosOdsObjetivo(inputDir: string): PromedioOdsObjetivoRecord[] {
  const rows = readCsv(inputDir, 'promedios_municipio_ods_objetivo.csv');
  return rows.map(row => ({
    codigo_ine: row.codigo_ine,
    ods_objetivo: String(row.ods_objetivo),
    promedio_metas: toNumber(row.promedio_metas),
    n_metas: toNumber(row.n_metas),
  }));
}
