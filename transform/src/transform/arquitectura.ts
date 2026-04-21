import type { MetadataRecord } from '../parse/index.js';
import { AGENDA_LE_PREFIX } from './agenda-constants.js';

export interface ArquitecturaL2Row {
  parent: string;
  child: string;
}

export function extractArquitecturaL2(records: MetadataRecord[]): ArquitecturaL2Row[] {
  const rows: ArquitecturaL2Row[] = [];
  const seen = new Set<string>();

  for (const r of records) {
    const child = r.indicador;

    for (const dim of r.meta) {
      const parent = `2030-${dim}`;
      const key = `${parent}|${child}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ parent, child });
      }
    }

    for (const dim of r.ods) {
      const parent = `2030-${dim}`;
      const key = `${parent}|${child}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ parent, child });
      }
    }

    for (const dim of r.le2) {
      const parent = `${AGENDA_LE_PREFIX}${dim}`;
      const key = `${parent}|${child}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ parent, child });
      }
    }

    for (const dim of r.le) {
      const parent = `${AGENDA_LE_PREFIX}${dim}`;
      const key = `${parent}|${child}`;
      if (!seen.has(key)) {
        seen.add(key);
        rows.push({ parent, child });
      }
    }
  }

  return rows;
}
