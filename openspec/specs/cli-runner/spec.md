## ADDED Requirements

### Requirement: CLI entry point
The system SHALL provide a CLI command runnable via `npx tsx src/index.ts` or a `package.json` script (e.g., `npm run transform`) that executes the full pipeline.

#### Scenario: Run via npm script
- **WHEN** a user runs `npm run transform` in the `transform/` directory
- **THEN** the pipeline reads CSVs from the configured input directory and produces a SQLite database at the configured output path

#### Scenario: Default paths
- **WHEN** the CLI runs without explicit path arguments
- **THEN** it SHALL read from `../dataset/` (relative to the transform directory) and output to `../output/diputacion_tarragona.db`

### Requirement: Configurable input and output paths
The system SHALL accept optional CLI arguments or environment variables to override the default dataset input directory and database output path.

#### Scenario: Custom input path
- **WHEN** the CLI runs with `--input /path/to/csvs`
- **THEN** it reads CSV files from `/path/to/csvs` instead of the default

#### Scenario: Custom output path
- **WHEN** the CLI runs with `--output /path/to/output.db`
- **THEN** the resulting SQLite database is written to `/path/to/output.db`

### Requirement: Progress logging
The system SHALL log progress to stdout as it processes each phase: parsing, schema creation, data loading, and completion summary.

#### Scenario: Successful run output
- **WHEN** the pipeline completes successfully
- **THEN** stdout includes messages indicating: number of CSVs parsed, tables created, rows inserted per table, and total execution time

#### Scenario: Warning on skipped data
- **WHEN** the pipeline skips rows due to missing metadata references
- **THEN** a warning message is logged to stderr with the indicator ID and reason

### Requirement: Exit code semantics
The system SHALL exit with code `0` on success and non-zero on failure.

#### Scenario: Success exit
- **WHEN** the pipeline completes without errors
- **THEN** the process exits with code `0`

#### Scenario: Failure exit
- **WHEN** a critical error occurs (e.g., missing input directory, malformed CSV)
- **THEN** the process exits with a non-zero code and logs the error message to stderr
