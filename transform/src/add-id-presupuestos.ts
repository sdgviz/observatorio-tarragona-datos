/**
 * Añade la columna id_presupuestos a municipios_tarragona.csv.
 *
 * Relación: inventario_filtered.long_code === municipios_tarragona.codigo_ine + 'AA000'
 * El id_presupuestos es la primera columna (id) de inventario_filtered.
 *
 * Uso:
 *   pnpm run add-id-presupuestos
 *   pnpm run add-id-presupuestos -- --output ../diputacion_tarragona/app/assets/data/municipios_tarragona.csv
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LISTACUSTOM = resolve(__dirname, '../../listacustom');

function parseArgs(): {
  inventarioPath: string;
  municipiosPath: string;
  outputPath: string;
} {
  const args = process.argv.slice(2);
  let inventarioPath = resolve(LISTACUSTOM, 'inventario_filtered.csv');
  let municipiosPath = resolve(LISTACUSTOM, 'municipios_tarragona.csv');
  let outputPath = resolve(LISTACUSTOM, 'municipios_tarragona_with_id_presupuestos.csv');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--inventario' && args[i + 1]) {
      inventarioPath = resolve(args[++i]);
    } else if (args[i] === '--municipios' && args[i + 1]) {
      municipiosPath = resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = resolve(args[++i]);
    }
  }

  return { inventarioPath, municipiosPath, outputPath };
}

const csvParseOptions = {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
  relax_quotes: true,
  relax_column_count: true,
};

function main(): void {
  const { inventarioPath, municipiosPath, outputPath } = parseArgs();

  const inventarioContent = readFileSync(inventarioPath, 'utf-8');
  const inventarioRows = parse(inventarioContent, csvParseOptions) as Array<{
    id: string;
    long_code: string;
    [key: string]: string;
  }>;

  const longCodeToId = new Map<string, string>();
  for (const row of inventarioRows) {
    const code = (row.long_code ?? '').trim();
    if (code) {
      longCodeToId.set(code, (row.id ?? '').trim());
    }
  }

  const municipiosContent = readFileSync(municipiosPath, 'utf-8');
  const municipiosRows = parse(municipiosContent, csvParseOptions) as Array<
    Record<string, string>
  >;

  const columns = [
    ...Object.keys(municipiosRows[0] ?? {}),
    'id_presupuestos',
  ];

  function escapeCsvField(val: string): string {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const outputLines: string[] = [columns.join(',')];

  for (const row of municipiosRows) {
    const codigoIne = (row.codigo_ine ?? '').trim();
    const longCode = codigoIne ? `${codigoIne}AA000` : '';
    const idPresupuestos = longCodeToId.get(longCode) ?? '';
    const outRow = {
      ...row,
      id_presupuestos: idPresupuestos,
    };
    outputLines.push(
      columns.map((col) => escapeCsvField(outRow[col] ?? '')).join(',')
    );
  }

  writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');
  console.log(`Escrito: ${outputPath} (${outputLines.length - 1} filas)`);
}

main();
