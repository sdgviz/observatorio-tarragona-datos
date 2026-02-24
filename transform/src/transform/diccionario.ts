import type { DiccionarioRecord } from '../parse/index.js';

export interface DiccionarioRow {
  id_dict: string;
  nivel: number;
  agenda: string;
  logo: string | null;
}

export interface DiccionarioEsRow {
  id_dict: string;
  nombre: string | null;
  descripcion: string | null;
}

export function transformDiccionario(records: DiccionarioRecord[]): {
  diccionario: DiccionarioRow[];
  diccionarioEs: DiccionarioEsRow[];
} {
  const dictMap = new Map<string, DiccionarioRow>();
  const esMap = new Map<string, DiccionarioEsRow>();

  for (const r of records) {
    const id_dict = `${r.agenda}-${r.dimension}`;

    if (dictMap.has(id_dict)) {
      console.error(`Warning: duplicate diccionario entry "${id_dict}", keeping first occurrence`);
      continue;
    }

    dictMap.set(id_dict, {
      id_dict,
      nivel: r.nivel,
      agenda: r.agenda,
      logo: r.logo,
    });

    esMap.set(id_dict, {
      id_dict,
      nombre: r.nombre,
      descripcion: r.detalle,
    });
  }

  return {
    diccionario: Array.from(dictMap.values()),
    diccionarioEs: Array.from(esMap.values()),
  };
}
