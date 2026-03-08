import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { TestResult } from '../runner.js';

interface RegionRow {
  codigo_ine: string;
}

interface IndicadorRow {
  indicador: string;
  codigo_ine: string;
}

interface MetadataRow {
  indicador: string;
}

interface CodigoIneRow {
  codigo_ine: string;
}

function parseCsv<T extends Record<string, string>>(filePath: string): T[] {
  const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
  if (!headerLine) {
    return [];
  }

  const headers = headerLine.split(',').map(h => h.trim());

  return lines.map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row as T;
  });
}

function checkCodigoIneConsistency(
  inputDir: string,
  results: TestResult[],
  regionesPath: string,
  checkFile: string,
  checkId: string,
  checkDescription: string,
): void {
  try {
    const regiones = parseCsv<RegionRow>(regionesPath);
    const rows = parseCsv<CodigoIneRow>(join(inputDir, checkFile));

    const validCodes = new Set(regiones.map(r => r.codigo_ine.trim()));
    const orphaned = new Set<string>();

    for (const row of rows) {
      const code = row.codigo_ine?.trim();
      if (code && !validCodes.has(code)) {
        orphaned.add(code);
      }
    }

    if (orphaned.size === 0) {
      results.push({ id: checkId, description: checkDescription, status: 'pass' });
    } else {
      results.push({
        id: checkId,
        description: checkDescription,
        status: 'fail',
        details: `codigo_ine not found in regiones.csv: ${[...orphaned].sort().join(', ')}`,
      });
    }
  } catch (error) {
    results.push({
      id: checkId,
      description: checkDescription,
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export function runDataChecks(inputDir: string): TestResult[] {
  const results: TestResult[] = [];
  const regionesPath = join(inputDir, 'regiones.csv');

  try {
    const indicadoresPath = join(inputDir, 'indicadores_agendas.csv');

    const regiones = parseCsv<RegionRow>(regionesPath);
    const indicadores = parseCsv<IndicadorRow>(indicadoresPath);

    const indicatorsByRegion = new Map<string, number>();

    for (const region of regiones) {
      indicatorsByRegion.set(region.codigo_ine, 0);
    }

    for (const indicador of indicadores) {
      const current = indicatorsByRegion.get(indicador.codigo_ine) ?? 0;
      indicatorsByRegion.set(indicador.codigo_ine, current + 1);
    }

    const regionsWithoutIndicators = Array.from(indicatorsByRegion.entries())
      .filter(([, count]) => count === 0)
      .map(([codigo]) => codigo);

    if (regionsWithoutIndicators.length === 0) {
      results.push({
        id: 'data-one-indicator-per-region',
        description: 'Each region has at least one indicator',
        status: 'pass'
      });
    } else {
      results.push({
        id: 'data-one-indicator-per-region',
        description: 'Each region has at least one indicator',
        status: 'fail',
        details: `Regions without indicators: ${regionsWithoutIndicators.join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      id: 'data-one-indicator-per-region',
      description: 'Each region has at least one indicator',
      status: 'error',
      details: error instanceof Error ? error.message : String(error)
    });
  }

  try {
    const indicadoresPath = join(inputDir, 'indicadores_agendas.csv');
    const metadataPath = join(inputDir, 'metadatos_agendas.csv');

    const indicadores = parseCsv<IndicadorRow>(indicadoresPath);
    const metadata = parseCsv<MetadataRow>(metadataPath);

    const indicadoresSet = new Set<string>();
    const metadataSet = new Set<string>();

    for (const indicador of indicadores) {
      if (indicador.indicador) {
        indicadoresSet.add(indicador.indicador);
      }
    }

    for (const meta of metadata) {
      if (meta.indicador) {
        metadataSet.add(meta.indicador);
      }
    }

    const missingInMetadata: string[] = [];
    for (const indicador of indicadoresSet) {
      if (!metadataSet.has(indicador)) {
        missingInMetadata.push(indicador);
      }
    }

    if (missingInMetadata.length === 0) {
      results.push({
        id: 'data-indicators-have-metadata',
        description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
        status: 'pass'
      });
    } else {
      results.push({
        id: 'data-indicators-have-metadata',
        description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
        status: 'fail',
        details: `Indicators missing in metadata: ${missingInMetadata.join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      id: 'data-indicators-have-metadata',
      description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
      status: 'error',
      details: error instanceof Error ? error.message : String(error)
    });
  }

  // codigo_ine consistency: all files that reference regions must use codes present in regiones.csv
  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'indicadores_agendas.csv',
    'data-indicadores-agendas-codigo-ine',
    'All codigo_ine in indicadores_agendas.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'descriptivos.csv',
    'data-descriptivos-codigo-ine',
    'All codigo_ine in descriptivos.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_meta_ods.csv',
    'data-promedios-meta-ods-codigo-ine',
    'All codigo_ine in promedios_municipio_meta_ods.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_objetivo_aue.csv',
    'data-promedios-objetivo-aue-codigo-ine',
    'All codigo_ine in promedios_municipio_objetivo_aue.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_ods_objetivo.csv',
    'data-promedios-ods-objetivo-codigo-ine',
    'All codigo_ine in promedios_municipio_ods_objetivo.csv exist in regiones.csv',
  );

  return results;
}

