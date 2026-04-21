# au-home-promedios-api

## ADDED Requirements

### Requirement: Provincial AU objective promedios endpoint

The system SHALL expose `GET /api/au/promedios` that returns, for a single AU strategic objective, all municipios that have a stored average index in `PROMEDIOS_AGENDAS` for the corresponding objective-level dictionary id (`AUE-{objetivo}` where `objetivo` is 1–10).

#### Scenario: Valid objective returns rows

- **WHEN** a client requests `/api/au/promedios?objetivo=3`
- **THEN** the handler SHALL validate `objetivo` as an integer from 1 to 10
- **AND** it SHALL query `PROMEDIOS_AGENDAS` for `id_dict = 'AUE-3'`
- **AND** each returned row SHALL include `codigo_ine`, `valor` (promedio index), `n_indicadores`, and `periodo` where available, matching the field semantics of `GET /api/ods/promedios`

#### Scenario: Missing objective returns 400

- **WHEN** the `objetivo` query parameter is absent or not an integer in 1–10
- **THEN** the server SHALL respond with HTTP 400 and a clear status message

#### Scenario: Read-only database access

- **WHEN** the endpoint executes
- **THEN** it SHALL use parameterized SQL via the existing read-only database helper
- **AND** it SHALL not perform writes
