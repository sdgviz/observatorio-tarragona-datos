import type Database from 'better-sqlite3';
import type { TransformedData } from '../transform/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function insertMany(
  db: Database.Database,
  table: string,
  columns: string[],
  rows: any[],
): number {
  if (rows.length === 0) return 0;

  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);

  const tx = db.transaction((items: any[]) => {
    for (const item of items) {
      try {
        stmt.run(...columns.map(col => item[col] ?? null));
      } catch (err) {
        const values = columns.map(col => item[col] ?? null);
        console.error(`  Error inserting into ${table}: ${(err as Error).message}`);
        console.error(`    Values: ${JSON.stringify(Object.fromEntries(columns.map((c, i) => [c, values[i]])))}`);
        throw err;
      }
    }
  });

  tx(rows);
  return rows.length;
}

export function loadAll(db: Database.Database, data: TransformedData): void {
  console.log('Loading data into database...');

  const counts: Record<string, number> = {};

  counts['REGIONES'] = insertMany(db, 'REGIONES',
    ['codigo_ine', 'nombre', 'poblacion', 'id_poblacion', 'id_especial'],
    data.regiones,
  );

  counts['METADATA'] = insertMany(db, 'METADATA',
    ['id_indicador', 'tipo', 'unidad', 'tipo_dato', 'formula', 'umbral_optimo', 'umbral_malo', 'fuente', 'actualizacion', 'corte_muestra', 'muestra_ods', 'muestra_aue'],
    data.metadata,
  );

  counts['METADATA_ES'] = insertMany(db, 'METADATA_ES',
    ['id_indicador', 'nombre', 'descripcion'],
    data.metadataEs,
  );

  counts['DICCIONARIO'] = insertMany(db, 'DICCIONARIO',
    ['id_dict', 'nivel', 'agenda', 'logo'],
    data.diccionario,
  );

  counts['DICCIONARIO_ES'] = insertMany(db, 'DICCIONARIO_ES',
    ['id_dict', 'nombre', 'descripcion'],
    data.diccionarioEs,
  );

  counts['ARQUITECTURA_L2'] = insertMany(db, 'ARQUITECTURA_L2',
    ['parent', 'child'],
    data.arquitecturaL2,
  );

  counts['INDICADORES_AGENDAS'] = insertMany(db, 'INDICADORES_AGENDAS',
    ['id_indicador', 'codigo_ine', 'periodo', 'valor', 'indice', 'categoria', 'no_agregar', 'texto'],
    data.indicadoresAgendas,
  );

  counts['INDICADORES_ODS'] = insertMany(db, 'INDICADORES_ODS',
    ['id_indicador', 'codigo_ine', 'periodo', 'valor', 'indice', 'categoria', 'no_agregar', 'texto'],
    data.indicadoresOds,
  );

  counts['INDICADORES_DESCRIPTIVOS'] = insertMany(db, 'INDICADORES_DESCRIPTIVOS',
    ['id_indicador', 'codigo_ine', 'periodo', 'valor', 'umbral'],
    data.indicadoresDescriptivos,
  );

  counts['PROMEDIOS_ODS'] = insertMany(db, 'PROMEDIOS_ODS',
    ['id_dict', 'codigo_ine', 'periodo', 'valor', 'n_indicadores', 'ods_objetivo'],
    data.promediosOds,
  );

  counts['PROMEDIOS_AGENDAS'] = insertMany(db, 'PROMEDIOS_AGENDAS',
    ['id_dict', 'codigo_ine', 'periodo', 'valor', 'n_indicadores'],
    data.promediosAgendas,
  );

  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table}: ${count} rows inserted`);
  }

  console.log('Data loading complete\n');
}
