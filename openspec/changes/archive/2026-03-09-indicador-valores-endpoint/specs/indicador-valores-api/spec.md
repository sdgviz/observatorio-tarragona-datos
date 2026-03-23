# Indicador valores API

## ADDED Requirements

### Requirement: GET endpoint for indicator values
The system SHALL provide a GET endpoint at `/api/indicadores/valores` that returns indicator value(s) from the INDICADORES table. The endpoint SHALL accept a required query parameter `indicator_id` (código del indicador) and optional query parameters `ine` (código INE del municipio) and `year` (año/periodo). When exactly one row matches the criteria, the response SHALL be a single JSON object; when zero or multiple rows match, the response SHALL be a JSON array (empty array when zero rows in list mode).

#### Scenario: Request with indicator_id, ine, and year returns single value
- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>&ine=<codigo_ine>&year=<periodo>` and a row exists in INDICADORES for that combination
- **THEN** the response status is 200 and the body is a single JSON object
- **AND** the object SHALL contain at least `codigo_ine`, `id_indicador`, `periodo`, `valor`
- **AND** other INDICADORES columns (e.g. `indice`, `categoria`) MAY be included when present in the table

#### Scenario: Request with indicator_id, ine, and year returns 404 when no data
- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>&ine=<codigo_ine>&year=<periodo>` and no row exists in INDICADORES for that combination
- **THEN** the response status is 404
- **AND** the response body or status message indicates that no value was found

#### Scenario: Request without year returns all years (time series)
- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>` or `GET /api/indicadores/valores?indicator_id=<id>&ine=<codigo_ine>` (year omitted)
- **THEN** the response status is 200 and the body is a JSON array of indicator value objects
- **AND** the array SHALL include all rows from INDICADORES matching the given indicator_id (and ine if provided)
- **AND** each element SHALL contain at least `codigo_ine`, `id_indicador`, `periodo`, `valor`
- **AND** when multiple rows are returned, the array SHALL be ordered by `periodo` ascending, then `codigo_ine` ascending

#### Scenario: Request without ine returns all municipios
- **WHEN** a client sends `GET /api/indicadores/valores?indicator_id=<id>` or `GET /api/indicadores/valores?indicator_id=<id>&year=<periodo>` (ine omitted)
- **THEN** the response status is 200 and the body is a JSON array of indicator value objects
- **AND** the array SHALL include all rows from INDICADORES matching the given indicator_id (and year if provided)
- **AND** each element SHALL contain at least `codigo_ine`, `id_indicador`, `periodo`, `valor`
- **AND** when multiple rows are returned, the array SHALL be ordered by `periodo` ascending, then `codigo_ine` ascending

#### Scenario: Missing indicator_id returns 400
- **WHEN** a client sends `GET /api/indicadores/valores` without the `indicator_id` query parameter (or with empty indicator_id)
- **THEN** the response status is 400
- **AND** the response body or status message indicates that indicator_id is required

#### Scenario: Empty result in list mode returns 200 with empty array
- **WHEN** a client sends a request that returns a list (e.g. indicator_id only, or indicator_id + year) and no rows exist in INDICADORES for that combination
- **THEN** the response status is 200 and the body is a JSON array
- **AND** the array SHALL be empty

### Requirement: Use read-only database and parameterized queries
The endpoint SHALL use the existing server database access (`useDatabase()`) and SHALL perform only read operations against the INDICADORES table. All query parameters (indicator_id, ine, year) SHALL be passed as bound parameters; the implementation SHALL NOT concatenate user input into SQL strings.

#### Scenario: Parameterized queries
- **WHEN** the handler builds SQL that filters by indicator_id, ine, or year
- **THEN** those values SHALL be passed as parameters to the prepared statement (e.g. `?.all(indicatorId, ...)`) and SHALL NOT be interpolated into the SQL string
