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

function parseCsv<T extends Record<string, string>>(filePath: string): T[] {
  const content = readFileSync(filePath, 'utf8');
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

export function runDataChecks(inputDir: string): TestResult[] {
  const results: TestResult[] = [];

  try {
    const regionesPath = join(inputDir, 'regiones.csv');
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

  return results;
}

