import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));

type AgendaId = 'ods' | 'au' | 'desc';

interface TreeNode {
  id: string;
  nombre: string;
  children?: (TreeNode | IndicatorLeaf)[];
}

interface IndicatorLeaf {
  id_indicador: string;
  nombre: string;
  detalle: string | null;
}

interface AgendaPayload {
  id: AgendaId;
  label: string;
  tree?: TreeNode;
  indicators?: IndicatorLeaf[];
}

interface MunicipioPayload {
  codigo_ine: string;
  nombre: string;
  ods: string[];
  au: string[];
  desc: string[];
}

interface ObjetivoMetaPayload {
  id_dict: string;
  nombre: string;
  nivel: number;
  parent?: string;
  municipios: Record<string, number | null>;
}

interface ObjetivosMetasPayload {
  ods: ObjetivoMetaPayload[];
  au: ObjetivoMetaPayload[];
}

function parseArgs(): {
  dbPath: string;
  configPath: string;
  outDir: string;
} {
  const args = process.argv.slice(2);
  const root = resolve(__dirname, '../..');
  let dbPath = resolve(root, 'output/diputacion_tarragona.db');
  let configPath = resolve(root, 'config/static-viewer-sample.json');
  let outDir = resolve(root, 'docs/static-db-viewer');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db' && args[i + 1]) {
      dbPath = resolve(args[++i]);
    } else if (args[i] === '--config' && args[i + 1]) {
      configPath = resolve(args[++i]);
    } else if (args[i] === '--out' && args[i + 1]) {
      outDir = resolve(args[++i]);
    }
  }
  return { dbPath, configPath, outDir };
}

function loadSampleConfig(configPath: string): string[] | null {
  if (!existsSync(configPath)) return null;
  const raw = readFileSync(configPath, 'utf8');
  const config: SampleConfig = JSON.parse(raw);
  if (Array.isArray(config.codigo_ine) && config.codigo_ine.length > 0) {
    return config.codigo_ine;
  }
  return null;
}

function buildAgendas(db: Database.Database): AgendaPayload[] {
  const agendas: AgendaPayload[] = [];

  const dictRows = db
    .prepare(
      `SELECT d.id_dict, d.nivel, d.agenda, COALESCE(de.nombre, d.id_dict) AS nombre
       FROM DICCIONARIO d
       LEFT JOIN DICCIONARIO_ES de ON de.id_dict = d.id_dict
       ORDER BY d.agenda, d.nivel, d.id_dict`,
    )
    .all() as { id_dict: string; nivel: number; agenda: string; nombre: string }[];

  const dimensionFromIdDict = (id_dict: string, agendaKey: string): string =>
    id_dict.startsWith(agendaKey + '-') ? id_dict.slice(agendaKey.length + 1) : id_dict;

  const archRows = db
    .prepare('SELECT parent, child FROM ARQUITECTURA_L2')
    .all() as { parent: string; child: string }[];
  const parentToChildren = new Map<string, string[]>();
  for (const r of archRows) {
    const list = parentToChildren.get(r.parent) ?? [];
    list.push(r.child);
    parentToChildren.set(r.parent, list);
  }

  const metaEsRows = db
    .prepare('SELECT id_indicador, nombre, descripcion FROM METADATA_ES')
    .all() as { id_indicador: string; nombre: string | null; descripcion: string | null }[];
  const metaEsMap = new Map(metaEsRows.map(r => [r.id_indicador, r]));

  const metaRows = db
    .prepare('SELECT id_indicador, tipo FROM METADATA')
    .all() as { id_indicador: string; tipo: string }[];
  const tipoMap = new Map(metaRows.map(r => [r.id_indicador, r.tipo]));

  function buildTree(agendaKey: string): TreeNode | undefined {
    const nodes = dictRows.filter(r => r.agenda === agendaKey);
    if (nodes.length === 0) return undefined;

    const byNivel1 = nodes.filter(n => n.nivel === 1);
    const byNivel2 = nodes.filter(n => n.nivel === 2);

    const root: TreeNode = { id: agendaKey, nombre: agendaKey, children: [] };
    for (const n1 of byNivel1) {
      const dim1 = dimensionFromIdDict(n1.id_dict, agendaKey);
      const child2 = byNivel2.filter(n2 => dimensionFromIdDict(n2.id_dict, agendaKey).startsWith(dim1 + '.'));
      const leaves: IndicatorLeaf[] = [];
      const subNodes: TreeNode[] = [];
      for (const n2 of child2) {
        const indIds = parentToChildren.get(n2.id_dict) ?? [];
        for (const id of indIds) {
          const me = metaEsMap.get(id);
          leaves.push({
            id_indicador: id,
            nombre: me?.nombre ?? id,
            detalle: me?.descripcion ?? null,
          });
        }
        if (indIds.length > 0) {
          subNodes.push({
            id: n2.id_dict,
            nombre: n2.nombre,
            children: indIds.map(id => {
              const me = metaEsMap.get(id);
              return { id_indicador: id, nombre: me?.nombre ?? id, detalle: me?.descripcion ?? null };
            }),
          });
        }
      }
      const n1Children: (TreeNode | IndicatorLeaf)[] = subNodes.length > 0 ? subNodes : leaves;
      if (n1Children.length > 0) {
        root.children!.push({ id: n1.id_dict, nombre: n1.nombre, children: n1Children });
      }
    }
    return root.children!.length > 0 ? root : undefined;
  }

  const odsTree = buildTree('2030');
  if (odsTree) {
    agendas.push({ id: 'ods', label: 'ODS', tree: odsTree });
  }

  const auTree = buildTree('TARRAGONA');
  if (auTree) {
    agendas.push({ id: 'au', label: 'Agenda Metropolitana de Tarragona', tree: auTree });
  }

  const descIndicators = metaRows
    .filter(r => r.tipo === 'descriptivo')
    .map(r => {
      const me = metaEsMap.get(r.id_indicador);
      return { id_indicador: r.id_indicador, nombre: me?.nombre ?? r.id_indicador, detalle: me?.descripcion ?? null };
    });
  if (descIndicators.length > 0) {
    agendas.push({ id: 'desc', label: 'Indicadores descriptivos', indicators: descIndicators });
  }

  return agendas;
}

function buildMunicipios(
  db: Database.Database,
  sampleCodigoIne: string[] | null,
): MunicipioPayload[] {
  const regiones = db
    .prepare('SELECT codigo_ine, nombre FROM REGIONES')
    .all() as { codigo_ine: string; nombre: string }[];
  const allCodigos = regiones.map(r => r.codigo_ine);
  const codigos = sampleCodigoIne ?? allCodigos;
  const nameByCodigo = new Map(regiones.map(r => [r.codigo_ine, r.nombre]));

  const indRows = db.prepare(
    `SELECT DISTINCT i.id_indicador, i.codigo_ine, m.tipo
     FROM INDICADORES i
     JOIN METADATA m ON m.id_indicador = i.id_indicador`,
  ).all() as { id_indicador: string; codigo_ine: string; tipo: string }[];
  const descRows = db
    .prepare('SELECT DISTINCT id_indicador, codigo_ine FROM INDICADORES_DESCRIPTIVOS')
    .all() as { id_indicador: string; codigo_ine: string }[];

  const odsByMun = new Map<string, Set<string>>();
  const auByMun = new Map<string, Set<string>>();
  const descByMun = new Map<string, Set<string>>();
  for (const r of indRows) {
    if (!codigos.includes(r.codigo_ine)) continue;
    const target = r.tipo === 'ods' ? odsByMun : auByMun;
    const set = target.get(r.codigo_ine) ?? new Set();
    set.add(r.id_indicador);
    target.set(r.codigo_ine, set);
  }
  for (const r of descRows) {
    if (!codigos.includes(r.codigo_ine)) continue;
    const set = descByMun.get(r.codigo_ine) ?? new Set();
    set.add(r.id_indicador);
    descByMun.set(r.codigo_ine, set);
  }

  return codigos.map(codigo_ine => ({
    codigo_ine,
    nombre: nameByCodigo.get(codigo_ine) ?? codigo_ine,
    ods: Array.from(odsByMun.get(codigo_ine) ?? []),
    au: Array.from(auByMun.get(codigo_ine) ?? []),
    desc: Array.from(descByMun.get(codigo_ine) ?? []),
  }));
}

function buildObjetivosMetasMunicipios(
  db: Database.Database,
  sampleCodigoIne: string[] | null,
): ObjetivosMetasPayload {
  const regiones = db
    .prepare('SELECT codigo_ine FROM REGIONES')
    .all() as { codigo_ine: string }[];
  const allCodigos = regiones.map(r => r.codigo_ine);
  const codigos = sampleCodigoIne ?? allCodigos;

  const dictRows = db
    .prepare(
      `SELECT d.id_dict, d.nivel, d.agenda, COALESCE(de.nombre, d.id_dict) AS nombre
       FROM DICCIONARIO d
       LEFT JOIN DICCIONARIO_ES de ON de.id_dict = d.id_dict
       WHERE d.agenda = '2030' OR d.agenda = 'TARRAGONA'
       ORDER BY d.agenda, d.nivel, d.id_dict`,
    )
    .all() as { id_dict: string; nivel: number; agenda: string; nombre: string }[];

  const promOdsRows = db
    .prepare(
      `SELECT id_dict, codigo_ine, periodo, valor FROM PROMEDIOS_ODS WHERE codigo_ine IN (${codigos.map(() => '?').join(',')})`,
    )
    .all(...codigos) as { id_dict: string; codigo_ine: string; periodo: number | null; valor: number | null }[];
  const promAgRows = db
    .prepare(
      `SELECT id_dict, codigo_ine, periodo, valor FROM PROMEDIOS_AGENDAS WHERE codigo_ine IN (${codigos.map(() => '?').join(',')})`,
    )
    .all(...codigos) as { id_dict: string; codigo_ine: string; periodo: number | null; valor: number | null }[];

  const valorByOds = new Map<string, { periodo: number; valor: number | null }>();
  for (const r of promOdsRows) {
    const key = `${r.id_dict}\t${r.codigo_ine}`;
    const period = r.periodo ?? 0;
    const prev = valorByOds.get(key);
    if (!prev || period > prev.periodo) valorByOds.set(key, { periodo: period, valor: r.valor });
  }
  const valorByAu = new Map<string, { periodo: number; valor: number | null }>();
  for (const r of promAgRows) {
    const key = `${r.id_dict}\t${r.codigo_ine}`;
    const period = r.periodo ?? 0;
    const prev = valorByAu.get(key);
    if (!prev || period > prev.periodo) valorByAu.set(key, { periodo: period, valor: r.valor });
  }

  const dimensionFromIdDict = (id_dict: string, agendaKey: string): string =>
    id_dict.startsWith(agendaKey + '-') ? id_dict.slice(agendaKey.length + 1) : id_dict;

  function buildAgendaEntries(agendaKey: string): ObjetivoMetaPayload[] {
    const nodes = dictRows.filter(r => r.agenda === agendaKey);
    const byNivel1 = nodes.filter(n => n.nivel === 1);
    const byNivel2 = nodes.filter(n => n.nivel === 2);
    const valorMap = agendaKey === '2030' ? valorByOds : valorByAu;
    const result: ObjetivoMetaPayload[] = [];

    for (const n1 of byNivel1) {
      const municipios: Record<string, number | null> = {};
      for (const c of codigos) {
        const entry = valorMap.get(`${n1.id_dict}\t${c}`);
        municipios[c] = entry?.valor ?? null;
      }
      result.push({ id_dict: n1.id_dict, nombre: n1.nombre, nivel: 1, municipios });

      const dim1 = dimensionFromIdDict(n1.id_dict, agendaKey);
      const child2 = byNivel2.filter(n2 => dimensionFromIdDict(n2.id_dict, agendaKey).startsWith(dim1 + '.'));
      for (const n2 of child2) {
        const municipios2: Record<string, number | null> = {};
        for (const c of codigos) {
          const entry = valorMap.get(`${n2.id_dict}\t${c}`);
          municipios2[c] = entry?.valor ?? null;
        }
        result.push({ id_dict: n2.id_dict, nombre: n2.nombre, nivel: 2, parent: n1.id_dict, municipios: municipios2 });
      }
    }
    return result;
  }

  return {
    ods: buildAgendaEntries('2030'),
    au: buildAgendaEntries('TARRAGONA'),
  };
}

function main(): void {
  const { dbPath, configPath, outDir } = parseArgs();

  console.log('=== Static DB Viewer ===');
  console.log(`DB: ${dbPath}`);
  console.log(`Config: ${configPath}`);
  console.log(`Output: ${outDir}\n`);

  if (!existsSync(dbPath)) {
    console.error(`Error: database not found: ${dbPath}`);
    process.exit(1);
  }

  const sampleCodigoIne = loadSampleConfig(configPath);
  if (sampleCodigoIne) {
    console.log(`Using sample config: ${sampleCodigoIne.length} municipalities`);
  } else {
    console.log('No sample config found; including all municipalities from DB');
  }

  const db = new Database(dbPath, { readonly: true });
  try {
    const agendas = buildAgendas(db);
    const municipios = buildMunicipios(db, sampleCodigoIne);
    const objetivosMetas = buildObjetivosMetasMunicipios(db, sampleCodigoIne);

    const dataDir = resolve(outDir, 'data');
    mkdirSync(dataDir, { recursive: true });

    writeFileSync(resolve(dataDir, 'agendas.json'), JSON.stringify(agendas, null, 2), 'utf8');
    writeFileSync(resolve(dataDir, 'municipios.json'), JSON.stringify(municipios, null, 2), 'utf8');
    writeFileSync(
      resolve(dataDir, 'objetivos_metas_municipios.json'),
      JSON.stringify(objetivosMetas, null, 2),
      'utf8',
    );

    console.log(`Wrote ${agendas.length} agendas, ${municipios.length} municipalities, objetivos_metas_municipios`);
    console.log(`Output: ${dataDir}`);
  } finally {
    db.close();
  }
}

main();
