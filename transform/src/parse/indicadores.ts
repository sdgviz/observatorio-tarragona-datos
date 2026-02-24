import { readCsv, toNullable, toNumber } from './csv-utils.js';

export interface IndicadorAgendaRecord {
  indicador: string;
  periodo: number;
  codigo_ine: string;
  valor: number | null;
  indice: number | null;
  categoria: string | null;
  no_agregar: string | null;
  texto: string | null;
}

export function parseIndicadoresAgendas(inputDir: string): IndicadorAgendaRecord[] {
  const rows = readCsv(inputDir, 'indicadores_agendas.csv');
  return rows.map(row => ({
    indicador: String(row.indicador),
    periodo: Number(row.periodo),
    codigo_ine: row.codigo_ine,
    valor: toNumber(row.valor),
    indice: toNumber(row.indice),
    categoria: toNullable(row.categoria),
    no_agregar: toNullable(row.no_agregar),
    texto: toNullable(row.texto),
  }));
}
