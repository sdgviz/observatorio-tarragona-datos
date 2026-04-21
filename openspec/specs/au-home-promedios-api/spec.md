# au-home-promedios-api

## Purpose

Server endpoint that returns per-objective / per-línea promedio indicators across all participating municipios, used by the home page and AU goal pages to render aggregate choropleths.
## Requirements
### Requirement: Provincial AU objective promedios endpoint

The system SHALL expose `GET /api/au/promedios` that returns, for a single Tarragona línea estratégica, all municipios that have a stored average index in `PROMEDIOS_AGENDAS` for the corresponding objective-level dictionary id (`TARRAGONA-{objetivo}` where `objetivo` is `1..6`).

#### Scenario: Valid objective returns rows

- **WHEN** a client requests `/api/au/promedios?objetivo=3`
- **THEN** the handler SHALL validate `objetivo` as an integer from 1 to 6
- **AND** it SHALL query `PROMEDIOS_AGENDAS` for `id_dict = 'TARRAGONA-3'`
- **AND** each returned row SHALL include `codigo_ine`, `valor` (promedio index), `n_indicadores`, and `periodo` where available, matching the field semantics of `GET /api/ods/promedios`

#### Scenario: Missing or out-of-range objective returns 400

- **WHEN** the `objetivo` query parameter is absent, non-numeric, or not an integer in `1..6`
- **THEN** the server SHALL respond with HTTP 400 and a clear status message

#### Scenario: Former AUE ids 7..10 return 400

- **WHEN** a client requests `/api/au/promedios?objetivo=7` (or `8`, `9`, `10`, previously valid under the AUE taxonomy)
- **THEN** the server SHALL respond with HTTP 400
- **AND** SHALL NOT query the database

#### Scenario: Read-only database access

- **WHEN** the endpoint executes
- **THEN** it SHALL use parameterized SQL via the existing read-only database helper
- **AND** it SHALL not perform writes

