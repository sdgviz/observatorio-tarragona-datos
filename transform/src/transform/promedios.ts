import type {
  PromedioMetaOdsRecord,
  PromedioObjetivoAueRecord,
  PromedioOdsObjetivoRecord,
} from '../parse/index.js';
import { AGENDA_LE_PREFIX } from './agenda-constants.js';

export interface PromedioOdsRow {
  id_dict: string;
  codigo_ine: string;
  periodo: number | null;
  valor: number | null;
  n_indicadores: number | null;
  ods_objetivo: string | null;
}

export interface PromedioAgendaRow {
  id_dict: string;
  codigo_ine: string;
  periodo: number | null;
  valor: number | null;
  n_indicadores: number | null;
}

export function transformPromedios(
  metaOds: PromedioMetaOdsRecord[],
  odsObjetivo: PromedioOdsObjetivoRecord[],
  objetivoAue: PromedioObjetivoAueRecord[],
): {
  promediosOds: PromedioOdsRow[];
  promediosAgendas: PromedioAgendaRow[];
} {
  const promediosOds: PromedioOdsRow[] = [];

  for (const r of metaOds) {
    promediosOds.push({
      id_dict: `2030-${r.meta_ods}`,
      codigo_ine: r.codigo_ine,
      periodo: r.periodo_max,
      valor: r.promedio_indice,
      n_indicadores: r.n_indicadores,
      ods_objetivo: r.ods_objetivo,
    });
  }

  for (const r of odsObjetivo) {
    promediosOds.push({
      id_dict: `2030-${r.ods_objetivo}`,
      codigo_ine: r.codigo_ine,
      periodo: null,
      valor: r.promedio_metas,
      n_indicadores: r.n_metas,
      ods_objetivo: null,
    });
  }

  const promediosAgendas: PromedioAgendaRow[] = [];

  for (const r of objetivoAue) {
    promediosAgendas.push({
      id_dict: `${AGENDA_LE_PREFIX}${r.objetivo_aue}`,
      codigo_ine: r.codigo_ine,
      periodo: r.periodo_max,
      valor: r.promedio_indice,
      n_indicadores: r.n_indicadores,
    });
  }

  return { promediosOds, promediosAgendas };
}
