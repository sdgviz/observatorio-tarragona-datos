import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { TestResult } from '../runner.js';
import { CSV_HEADER_CONTRACTS } from '../column-contracts.js';

function parseHeaderLine(line: string): string[] {
  return line.split(',').map((column) => column.trim());
}

export function runHeaderParityChecks(inputDir: string): TestResult[] {
  const results: TestResult[] = [];

  for (const [filename, expectedColumns] of Object.entries(CSV_HEADER_CONTRACTS)) {
    const id = `header-parity-${filename}`;
    const filePath = join(inputDir, filename);

    if (!existsSync(filePath)) {
      results.push({
        id,
        description: `CSV header parity (${filename}): file exists`,
        status: 'fail',
        details: `File not found: ${filePath}`,
      });
      continue;
    }

    try {
      const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
      const firstLine = content.split(/\r?\n/).find((line) => line.trim() !== '');

      if (!firstLine) {
        results.push({
          id,
          description: `CSV header parity (${filename}): non-empty header`,
          status: 'fail',
          details: 'File is empty or missing header line',
        });
        continue;
      }

      const headerColumns = parseHeaderLine(firstLine);
      const expectedSet = new Set(expectedColumns);
      const headerSet = new Set(headerColumns);
      const duplicateHeaders = headerSet.size !== headerColumns.length;

      const unexpected = [...headerSet].filter((h) => !expectedSet.has(h));
      const missing = [...expectedSet].filter((e) => !headerSet.has(e));

      if (duplicateHeaders || unexpected.length > 0 || missing.length > 0) {
        const parts: string[] = [];
        if (duplicateHeaders) {
          parts.push('Duplicate column names in header row');
        }
        if (unexpected.length > 0) {
          parts.push(`Unexpected columns: ${unexpected.sort().join(', ')}`);
        }
        if (missing.length > 0) {
          parts.push(`Missing columns: ${missing.sort().join(', ')}`);
        }
        results.push({
          id,
          description: `CSV header parity (${filename}): columns match contract`,
          status: 'fail',
          details: parts.join('; '),
        });
      } else {
        results.push({
          id,
          description: `CSV header parity (${filename}): columns match contract`,
          status: 'pass',
        });
      }
    } catch (error) {
      results.push({
        id,
        description: `CSV header parity (${filename}): readable`,
        status: 'error',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}
