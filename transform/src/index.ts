import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { parseAll } from './parse/index.js';
import { createSchema } from './schema/index.js';
import { transformAll } from './transform/index.js';
import { loadAll } from './load/loader.js';
import { runIntegrityChecks } from './integrity/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(): { input: string; output: string } {
  const args = process.argv.slice(2);
  let input = resolve(__dirname, '../../dataset');
  let output = resolve(__dirname, '../../output/diputacion_tarragona.db');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      input = resolve(args[++i]);
    } else if (args[i] === '--output' && args[i + 1]) {
      output = resolve(args[++i]);
    }
  }

  return { input, output };
}

function main(): void {
  const startTime = Date.now();
  const { input, output } = parseArgs();

  console.log('=== Diputación de Tarragona - CSV to SQLite Transform ===\n');

  if (!existsSync(input)) {
    console.error(`Error: input directory not found: ${input}`);
    process.exit(1);
  }

  const outputDir = dirname(output);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  if (existsSync(output)) {
    unlinkSync(output);
  }

  const integrity = runIntegrityChecks({ inputDir: input });
  const integrityBlockers = integrity.results.filter(
    (r) => r.status === 'fail' || r.status === 'error',
  );
  if (integrityBlockers.length > 0) {
    console.error('\nIntegrity checks failed — refusing to build the database:');
    for (const r of integrityBlockers) {
      console.error(`  [${r.status.toUpperCase()}] ${r.id}: ${r.description}`);
      if (r.details) {
        console.error(r.details.split('\n').map((line) => `    ${line}`).join('\n'));
      }
    }
    process.exit(1);
  }

  const parsed = parseAll(input);
  const transformed = transformAll(parsed);

  const db = new Database(output);
  try {
    createSchema(db);
    loadAll(db, transformed);
  } finally {
    db.close();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`=== Done in ${elapsed}s ===`);
  console.log(`Output: ${output}`);
}

main();
