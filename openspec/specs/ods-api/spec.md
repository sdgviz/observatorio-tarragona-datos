# ODS API

## ADDED Requirements

### Requirement: API endpoint returns ODS objective averages per municipality
The system SHALL expose a `GET /api/ods/promedios` endpoint that accepts a query parameter `objetivo` (integer 1–17) and returns a JSON array of objects for all municipalities. Each object SHALL include `codigo_ine`, `valor`, `n_indicadores`, and **`periodo`**. The `periodo` field SHALL be the value from `PROMEDIOS_ODS.periodo` for that row (JSON number when present, JSON `null` when the stored period is unknown for that aggregate row).

#### Scenario: Valid objective number returns municipality data
- **WHEN** a GET request is made to `/api/ods/promedios?objetivo=3`
- **THEN** the response SHALL have status 200
- **AND** the body SHALL be a JSON array where each element has `codigo_ine` (string), `valor` (number or null), `n_indicadores` (number), and `periodo` (number or null)
- **AND** there SHALL be one entry per municipality in the `REGIONES` table

#### Scenario: Missing objetivo parameter returns error
- **WHEN** a GET request is made to `/api/ods/promedios` without the `objetivo` query parameter
- **THEN** the response SHALL have status 400
- **AND** the body SHALL include an error message indicating the parameter is required

#### Scenario: Invalid objetivo value returns error
- **WHEN** a GET request is made to `/api/ods/promedios?objetivo=20`
- **THEN** the response SHALL have status 400
- **AND** the body SHALL include an error message indicating the value must be between 1 and 17

### Requirement: Database utility provides reusable connection
The system SHALL provide a server utility (`server/utils/db.ts`) that opens a read-only `better-sqlite3` connection to the SQLite database. The database path SHALL be configurable via the `DATABASE_PATH` environment variable with a default relative path to `../diputacion_tarragona_data/output/diputacion_tarragona.db`.

#### Scenario: Database file exists and is readable
- **WHEN** the server starts and `DATABASE_PATH` points to a valid SQLite file
- **THEN** the utility SHALL return a working database connection
- **AND** queries SHALL execute successfully

#### Scenario: Database file is missing
- **WHEN** the server starts and the configured database path does not exist
- **THEN** the utility SHALL throw a descriptive error indicating the file path that was checked

### Requirement: API maps numeric objective to database identifier
The API SHALL convert the numeric `objetivo` parameter (1–17) to the database format `2030-{N}` before querying the `PROMEDIOS_ODS` table's `ods_objetivo` column.

#### Scenario: Objective 1 queries for ods_objetivo '2030-1'
- **WHEN** a request is made with `objetivo=1`
- **THEN** the database query SHALL filter `PROMEDIOS_ODS` WHERE `ods_objetivo = '2030-1'`

#### Scenario: Objective 17 queries for ods_objetivo '2030-17'
- **WHEN** a request is made with `objetivo=17`
- **THEN** the database query SHALL filter `PROMEDIOS_ODS` WHERE `ods_objetivo = '2030-17'`
