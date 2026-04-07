# Municipios list API

## ADDED Requirements

### Requirement: List all municipalities
The system SHALL provide a GET endpoint at `/api/municipios/list` that returns a JSON array of all municipalities from the REGIONES table. Each element SHALL be an object containing all columns available for that municipality (e.g. `codigo_ine`, `nombre`, `poblacion`, `id_poblacion`, `id_especial`).

#### Scenario: Request without NMUN returns all municipalities
- **WHEN** a client sends `GET /api/municipios/list` with no query parameters
- **THEN** the response status is 200 and the body is a JSON array of municipality objects
- **AND** the array includes every row from REGIONES

#### Scenario: Response contains municipality fields
- **WHEN** a client receives a successful response from `GET /api/municipios/list`
- **THEN** each array element SHALL contain at least `codigo_ine` and `nombre`
- **AND** other REGIONES columns (e.g. `poblacion`, `id_poblacion`, `id_especial`) SHALL be present when they exist in the table

### Requirement: id_especial2 on municipality list objects

The JSON objects returned by `GET /api/municipios/list` SHALL include an `id_especial2` property on each municipality element when the `REGIONES` table defines that column. Values SHALL reflect the stored row (JSON string when set, JSON `null` when the column is null for that row).

#### Scenario: Unfiltered list includes id_especial2

- **WHEN** a client receives a successful response from `GET /api/municipios/list` without `NMUN`
- **THEN** each array element SHALL include `id_especial2` (string or null) consistent with the corresponding `REGIONES` row

#### Scenario: NMUN-filtered list includes id_especial2

- **WHEN** a client receives a successful response from `GET /api/municipios/list?NMUN=<valid>`
- **THEN** each array element SHALL include `id_especial2` (string or null) for that municipality as in the unfiltered response shape

### Requirement: Filter by population category (NMUN)
The system SHALL accept an optional query parameter `NMUN` on `GET /api/municipios/list`. When `NMUN` is present, the response SHALL contain only municipalities whose `id_poblacion` equals the provided value (exact match). When `NMUN` is omitted, the endpoint SHALL behave as in "List all municipalities".

#### Scenario: Request with valid NMUN returns filtered list
- **WHEN** a client sends `GET /api/municipios/list?NMUN=<value>` where `<value>` is a value that exists in REGIONES.`id_poblacion`
- **THEN** the response status is 200 and the body is a JSON array of municipality objects
- **AND** every returned municipality has `id_poblacion` equal to `<value>`

#### Scenario: Request with invalid NMUN returns 400
- **WHEN** a client sends `GET /api/municipios/list?NMUN=<value>` where `<value>` is not one of the distinct `id_poblacion` values in REGIONES (or is empty when trimmed)
- **THEN** the response status is 400
- **AND** the response body or status message indicates that the NMUN value is invalid

#### Scenario: NMUN optional
- **WHEN** a client sends `GET /api/municipios/list` without the `NMUN` query parameter
- **THEN** the response SHALL include all municipalities (no filter applied)

### Requirement: Use read-only database access
The endpoint SHALL use the existing server database access (`useDatabase()`) and SHALL perform only read operations against the REGIONES table. Queries SHALL use parameterized statements when filtering by NMUN.

#### Scenario: Parameterized filter
- **WHEN** the handler builds a query that filters by NMUN
- **THEN** the NMUN value SHALL be passed as a parameter (e.g. prepared statement) and SHALL NOT be concatenated into the SQL string
