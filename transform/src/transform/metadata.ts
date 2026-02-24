import type { MetadataRecord } from '../parse/index.js';

export interface MetadataRow {
  id_indicador: string;
  tipo: string;
  unidad: string | null;
  tipo_dato: string | null;
  formula: string | null;
  umbral_optimo: number | null;
  umbral_malo: number | null;
  fuente: string | null;
  actualizacion: string | null;
  corte_muestra: string | null;
  muestra_ods: string | null;
  muestra_aue: string | null;
}

export interface MetadataEsRow {
  id_indicador: string;
  nombre: string | null;
  descripcion: string | null;
}

function normalizeTipo(clase: string): string {
  if (clase === 'agendas') return 'agenda';
  return clase;
}

export function transformMetadata(records: MetadataRecord[]): {
  metadata: MetadataRow[];
  metadataEs: MetadataEsRow[];
} {
  const metadata: MetadataRow[] = [];
  const metadataEs: MetadataEsRow[] = [];

  for (const r of records) {
    metadata.push({
      id_indicador: r.indicador,
      tipo: normalizeTipo(r.clase),
      unidad: r.unidad,
      tipo_dato: r.tipo,
      formula: r.formula,
      umbral_optimo: r.umbral_optimo,
      umbral_malo: r.umbral_malo,
      fuente: r.fuente,
      actualizacion: r.actualizacion,
      corte_muestra: r.corte_muestra,
      muestra_ods: r.muestra_ods,
      muestra_aue: r.muestra_aue,
    });

    metadataEs.push({
      id_indicador: r.indicador,
      nombre: r.nombre,
      descripcion: r.detalle,
    });
  }

  return { metadata, metadataEs };
}
