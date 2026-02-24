import { readCsv, toNullable, toNumber, parseSemicolonList } from './csv-utils.js';

export interface MetadataRecord {
  indicador: string;
  clase: string;
  nombre: string | null;
  detalle: string | null;
  fuente: string | null;
  actualizacion: string | null;
  corte_muestra: string | null;
  unidad: string | null;
  tipo: string | null;
  formula: string | null;
  umbral_optimo: number | null;
  umbral_malo: number | null;
  ods: string[];
  meta: string[];
  aue1: string[];
  aue2: string[];
  muestra_ods: string | null;
  muestra_aue: string | null;
}

export function parseMetadata(inputDir: string): MetadataRecord[] {
  const rows = readCsv(inputDir, 'metadatos_agendas.csv');
  return rows.map(row => ({
    indicador: String(row.indicador),
    clase: row.clase,
    nombre: toNullable(row.nombre),
    detalle: toNullable(row.detalle),
    fuente: toNullable(row.fuente),
    actualizacion: toNullable(row.actualizacion),
    corte_muestra: toNullable(row.corte_muestra),
    unidad: toNullable(row.unidad),
    tipo: toNullable(row.tipo),
    formula: toNullable(row.formula),
    umbral_optimo: toNumber(row.umbral_optimo),
    umbral_malo: toNumber(row.umbral_malo),
    ods: parseSemicolonList(row.ods),
    meta: parseSemicolonList(row.meta),
    aue1: parseSemicolonList(row.aue1),
    aue2: parseSemicolonList(row.aue2),
    muestra_ods: toNullable(row.muestra_ods),
    muestra_aue: toNullable(row.muestra_aue),
  }));
}
