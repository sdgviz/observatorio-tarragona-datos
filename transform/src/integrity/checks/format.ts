import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { TestResult } from '../runner.js';
import { REQUIRED_CSV_FILES } from '../config.js';

function parseHeader(line: string): string[] {
  return line.split(',').map(column => column.trim());
}

export function runFormatChecks(inputDir: string): TestResult[] {
  const results: TestResult[] = [];

  for (const fileConfig of REQUIRED_CSV_FILES) {
    const filePath = join(inputDir, fileConfig.filename);

    // Existence
    if (!existsSync(filePath)) {
      results.push({
        id: `format-${fileConfig.filename}-exists`,
        description: `Required CSV file exists: ${fileConfig.filename}`,
        status: 'fail',
        details: `File not found: ${filePath}`
      });
      // If file does not exist, skip further checks for this file
      continue;
    } else {
      results.push({
        id: `format-${fileConfig.filename}-exists`,
        description: `Required CSV file exists: ${fileConfig.filename}`,
        status: 'pass'
      });
    }

    // Parseable and header check
    try {
      const content = readFileSync(filePath, 'utf8');
      const [firstLine] = content.split(/\r?\n/);

      if (!firstLine) {
        results.push({
          id: `format-${fileConfig.filename}-parse`,
          description: `CSV file is non-empty and parseable: ${fileConfig.filename}`,
          status: 'fail',
          details: 'File is empty or missing header line'
        });
        continue;
      }

      const headerColumns = parseHeader(firstLine);

      results.push({
        id: `format-${fileConfig.filename}-parse`,
        description: `CSV file is non-empty and parseable: ${fileConfig.filename}`,
        status: 'pass'
      });

      const missingColumns = fileConfig.requiredColumns.filter(
        required => !headerColumns.includes(required)
      );

      if (missingColumns.length > 0) {
        results.push({
          id: `format-${fileConfig.filename}-required-columns`,
          description: `CSV file contains required columns: ${fileConfig.filename}`,
          status: 'fail',
          details: `Missing columns: ${missingColumns.join(', ')}`
        });
      } else {
        results.push({
          id: `format-${fileConfig.filename}-required-columns`,
          description: `CSV file contains required columns: ${fileConfig.filename}`,
          status: 'pass'
        });
      }
    } catch (error) {
      results.push({
        id: `format-${fileConfig.filename}-parse`,
        description: `CSV file is non-empty and parseable: ${fileConfig.filename}`,
        status: 'error',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}

