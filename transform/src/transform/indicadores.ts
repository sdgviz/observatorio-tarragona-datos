import type { IndicadorAgendaRecord, DescriptivoRecord, MetadataRecord } from '../parse/index.js';

export interface IndicadorRow {
  id_indicador: string;
  codigo_ine: string;
  periodo: number;
  valor: number | null;
  indice: number | null;
  categoria: string | null;
  no_agregar: string | null;
  texto: string | null;
}

export interface DescriptivoRow {
  id_indicador: string;
  codigo_ine: string;
  periodo: number;
  valor: number | null;
  umbral: string | null;
}

export function mapIndicadores(
  indicadores: IndicadorAgendaRecord[],
  metadata: MetadataRecord[],
): {
  indicadores: IndicadorRow[];
  skipped: number;
} {
  const knownIds = new Set(metadata.map(m => m.indicador));
  const result: IndicadorRow[] = [];
  let skipped = 0;

  for (const row of indicadores) {
    if (!knownIds.has(row.indicador)) {
      console.error(`Warning: indicator "${row.indicador}" not found in metadata, skipping`);
      skipped++;
      continue;
    }

    result.push({
      id_indicador: row.indicador,
      codigo_ine: row.codigo_ine,
      periodo: row.periodo,
      valor: row.valor,
      indice: row.indice,
      categoria: row.categoria,
      no_agregar: row.no_agregar,
      texto: row.texto,
    });
  }

  return { indicadores: result, skipped };
}

export function transformDescriptivos(records: DescriptivoRecord[]): DescriptivoRow[] {
  return records.map(r => ({
    id_indicador: r.indicador,
    codigo_ine: r.codigo_ine,
    periodo: r.periodo,
    valor: r.valor,
    umbral: r.umbral,
  }));
}
