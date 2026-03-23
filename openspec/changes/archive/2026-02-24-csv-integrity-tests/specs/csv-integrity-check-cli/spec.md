## ADDED Requirements

### Requirement: CSV integrity check CLI command
The system SHALL provide a CLI command that runs a configurable set of integrity checks over the CSV source files **without** construir la base de datos SQLite.

#### Scenario: Run CSV integrity check locally
- **WHEN** a developer runs the CSV integrity command from the project root (por ejemplo `npm run check:csv`)
- **THEN** the command SHALL execute all configured integrity tests against the dataset directory
- **AND THEN** the command SHALL exit with code `0` if and only if all tests pass
- **AND THEN** the command SHALL exit with a non-zero code if any test fails or produces an error

### Requirement: Basic format checks for required CSV files
The CSV integrity check CLI SHALL validate basic format requirements for each required CSV file, including file presence, parseability, and required columns.

#### Scenario: All required CSV files are present and valid
- **WHEN** all required CSV files exist in the configured dataset directory
- **AND WHEN** each required CSV file can be parsed successfully
- **AND WHEN** each required CSV file contains all of its required columns
- **THEN** the CLI SHALL mark all basic format tests as `pass`
- **AND THEN** the CLI SHALL not include any format-related failures in the results

#### Scenario: A required CSV file is missing
- **WHEN** at least one required CSV file does not exist in the dataset directory
- **THEN** the CLI SHALL mark the corresponding file-existence test as `fail`
- **AND THEN** the CLI SHALL include in the test details which file is missing
- **AND THEN** the overall command exit code SHALL be non-zero

#### Scenario: A required CSV file cannot be parsed
- **WHEN** a required CSV file exists but cannot be parsed successfully
- **THEN** the CLI SHALL mark the corresponding parseability test as `fail` or `error`
- **AND THEN** the CLI SHALL include in the test details the parsing error or a summary of the problem
- **AND THEN** the overall command exit code SHALL be non-zero

#### Scenario: A required CSV file is missing required columns
- **WHEN** a required CSV file exists and can be parsed
- **AND WHEN** at least one required column is absent from the header row
- **THEN** the CLI SHALL mark the corresponding column-presence test as `fail`
- **AND THEN** the test details SHALL include which columns are missing
- **AND THEN** the overall command exit code SHALL be non-zero

### Requirement: Data consistency checks across CSV files
The CSV integrity check CLI SHALL validate the specified cross-file data consistency rules using the contents of the parsed CSVs.

#### Scenario: Each region has at least one indicator
- **WHEN** the regions CSV defines one or more regions
- **AND WHEN** the indicators CSV contains at least one indicator row for each region
- **THEN** the CLI SHALL mark the “one indicator per region” test as `pass`

#### Scenario: Some regions have no indicators
- **WHEN** the regions CSV defines one or more regions
- **AND WHEN** at least one of those regions does not appear in any indicators row
- **THEN** the CLI SHALL mark the “one indicator per region” test as `fail`
- **AND THEN** the test details SHALL list the regions that have no indicators
- **AND THEN** the overall command exit code SHALL be non-zero

#### Scenario: All indicators in indicadores_agendas have metadata
- **WHEN** every indicator identifier present in `indicadores_agendas.csv` also appears in `metadatos_agendas.csv`
- **THEN** the CLI SHALL mark the “indicators have metadata” test as `pass`

#### Scenario: Some indicators in indicadores_agendas are missing metadata
- **WHEN** at least one indicator identifier present in `indicadores_agendas.csv` does not appear in `metadatos_agendas.csv`
- **THEN** the CLI SHALL mark the “indicators have metadata” test as `fail`
- **AND THEN** the test details SHALL list the indicator identifiers that are missing in metadata
- **AND THEN** the overall command exit code SHALL be non-zero

### Requirement: Structured integrity test results
The CSV integrity check CLI SHALL produce a structured machine-readable results file that summarizes the outcome of all tests.

#### Scenario: All tests produce a structured results file
- **WHEN** the CSV integrity command finishes running (either with all tests passing or with some failures)
- **THEN** the CLI SHALL write a results file (for example `docs/csv-integrity/results.json`)
- **AND THEN** the results file SHALL include, for each test, at least: test identifier, description, status (`pass`/`fail`/`error`), and optional details

