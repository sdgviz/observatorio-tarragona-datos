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

export function routeIndicadores(
  indicadores: IndicadorAgendaRecord[],
  metadata: MetadataRecord[],
): {
  agendas: IndicadorRow[];
  ods: IndicadorRow[];
  skipped: number;
} {
  const typeMap = new Map<string, string>();
  for (const m of metadata) {
    typeMap.set(m.indicador, m.clase);
  }

  const agendas: IndicadorRow[] = [];
  const ods: IndicadorRow[] = [];
  let skipped = 0;

  for (const row of indicadores) {
    const clase = typeMap.get(row.indicador);

    if (!clase) {
      console.error(`Warning: indicator "${row.indicador}" not found in metadata, skipping`);
      skipped++;
      continue;
    }

    const mapped: IndicadorRow = {
      id_indicador: row.indicador,
      codigo_ine: row.codigo_ine,
      periodo: row.periodo,
      valor: row.valor,
      indice: row.indice,
      categoria: row.categoria,
      no_agregar: row.no_agregar,
      texto: row.texto,
    };

    if (clase === 'agendas') {
      agendas.push(mapped);
    } else if (clase === 'ods') {
      ods.push(mapped);
    }
  }

  return { agendas, ods, skipped };
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
