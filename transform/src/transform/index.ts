import type { ParsedData, RegionRecord } from '../parse/index.js';
import { transformMetadata, type MetadataRow, type MetadataEsRow } from './metadata.js';
import { extractArquitecturaL2, type ArquitecturaL2Row } from './arquitectura.js';
import { transformDiccionario, type DiccionarioRow, type DiccionarioEsRow } from './diccionario.js';
import { mapIndicadores, transformDescriptivos, type IndicadorRow, type DescriptivoRow } from './indicadores.js';
import { transformPromedios, type PromedioOdsRow, type PromedioAgendaRow } from './promedios.js';

export interface TransformedData {
  regiones: RegionRecord[];
  metadata: MetadataRow[];
  metadataEs: MetadataEsRow[];
  diccionario: DiccionarioRow[];
  diccionarioEs: DiccionarioEsRow[];
  arquitecturaL2: ArquitecturaL2Row[];
  indicadores: IndicadorRow[];
  indicadoresDescriptivos: DescriptivoRow[];
  promediosOds: PromedioOdsRow[];
  promediosAgendas: PromedioAgendaRow[];
}

export function transformAll(data: ParsedData): TransformedData {
  console.log('Transforming data...');

  const { metadata, metadataEs } = transformMetadata(data.metadata);
  console.log(`  METADATA: ${metadata.length} rows`);
  console.log(`  METADATA_ES: ${metadataEs.length} rows`);

  const { diccionario, diccionarioEs } = transformDiccionario(data.diccionario);
  console.log(`  DICCIONARIO: ${diccionario.length} rows`);
  console.log(`  DICCIONARIO_ES: ${diccionarioEs.length} rows`);

  const dictIds = new Set(diccionario.map(d => d.id_dict));
  const metaIds = new Set(metadata.map(m => m.id_indicador));
  const rawArquitectura = extractArquitecturaL2(data.metadata);
  const arquitecturaL2 = rawArquitectura.filter(row => {
    if (!dictIds.has(row.parent)) {
      console.error(`Warning: ARQUITECTURA_L2 parent "${row.parent}" not found in DICCIONARIO, skipping (child: ${row.child})`);
      return false;
    }
    if (!metaIds.has(row.child)) {
      console.error(`Warning: ARQUITECTURA_L2 child "${row.child}" not found in METADATA, skipping (parent: ${row.parent})`);
      return false;
    }
    return true;
  });
  if (rawArquitectura.length !== arquitecturaL2.length) {
    console.log(`  ARQUITECTURA_L2: ${arquitecturaL2.length} rows (${rawArquitectura.length - arquitecturaL2.length} skipped — missing FK references)`);
  } else {
    console.log(`  ARQUITECTURA_L2: ${arquitecturaL2.length} rows`);
  }

  const { indicadores, skipped } = mapIndicadores(data.indicadoresAgendas, data.metadata);
  console.log(`  INDICADORES: ${indicadores.length} rows`);
  if (skipped > 0) {
    console.log(`  (${skipped} indicator rows skipped — missing metadata)`);
  }

  const descriptivos = transformDescriptivos(data.descriptivos);
  console.log(`  INDICADORES_DESCRIPTIVOS: ${descriptivos.length} rows`);

  const { promediosOds, promediosAgendas } = transformPromedios(
    data.promediosMetaOds,
    data.promediosOdsObjetivo,
    data.promediosObjetivoAue,
  );
  console.log(`  PROMEDIOS_ODS: ${promediosOds.length} rows`);
  console.log(`  PROMEDIOS_AGENDAS: ${promediosAgendas.length} rows`);

  console.log('Transformation complete\n');

  return {
    regiones: data.regiones,
    metadata,
    metadataEs,
    diccionario,
    diccionarioEs,
    arquitecturaL2,
    indicadores,
    indicadoresDescriptivos: descriptivos,
    promediosOds,
    promediosAgendas,
  };
}
