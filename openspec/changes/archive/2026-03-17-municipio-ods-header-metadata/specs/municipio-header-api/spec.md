# Municipio header API

## ADDED Requirements

### Requirement: GET endpoint for municipio header metadata
The system SHALL provide a GET endpoint that returns header metadata for a single municipality by codigo_ine (INE). The route SHALL accept the municipio code as a path parameter (e.g. `/api/municipios/[ine]/header`). The response SHALL be a JSON object containing: `poblacion` (number or null), `id_especial` (string or null, comarca identifier from REGIONES), and when available the latest-year value for indicator id 48 including `valor`, `periodo`, and the indicator's `nombre` and `unidad` from METADATA/METADATA_ES.

#### Scenario: Request with valid ine returns header data
- **WHEN** a client sends `GET /api/municipios/<codigo_ine>/header` and the municipio exists in REGIONES
- **THEN** the response status is 200 and the body is a JSON object
- **AND** the object SHALL contain at least `poblacion` (number or null) and `id_especial` (string or null) from REGIONES for that codigo_ine
- **AND** if INDICADORES has at least one row for that codigo_ine and id_indicador = '48', the object SHALL include an indicador_48 (or equivalent) structure with `valor`, `periodo`, `nombre`, and `unidad` for the row with MAX(periodo) for that municipio and indicator

#### Scenario: Request with unknown ine returns 404
- **WHEN** a client sends `GET /api/municipios/<codigo_ine>/header` and no row exists in REGIONES for that codigo_ine
- **THEN** the response status is 404
- **AND** the response body or status message indicates that the municipio was not found

#### Scenario: Missing or empty ine returns 400
- **WHEN** a client sends a request without a valid path parameter (e.g. missing or empty ine)
- **THEN** the response status is 400
- **AND** the response body or status message indicates that the parameter is required or invalid

#### Scenario: Indicator 8 missing for municipio
- **WHEN** a client sends `GET /api/municipios/<codigo_ine>/header` and the municipio exists but INDICADORES has no row for id_indicador = '48' and that codigo_ine
- **THEN** the response status is 200
- **AND** the response SHALL include poblacion and id_especial as applicable
- **AND** the indicador_48 (or equivalent) field SHALL be null, omitted, or an empty object so the client can show a fallback

#### Scenario: Use read-only database and parameterized queries
- **WHEN** the handler queries REGIONES, INDICADORES, or METADATA
- **THEN** it SHALL use the existing server database access (e.g. `useDatabase()`) and SHALL perform only read operations
- **AND** codigo_ine and id_indicador SHALL be passed as bound parameters and SHALL NOT be concatenated into SQL strings
