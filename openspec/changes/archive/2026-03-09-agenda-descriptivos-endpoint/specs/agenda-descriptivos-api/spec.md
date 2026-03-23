## ADDED Requirements

### Requirement: Endpoint returns descriptive indicators for a municipality
The system SHALL expose `GET /api/agenda/descriptivos` which returns descriptive indicators for a given municipality, with reference-year and current-year values, metadata, and a temporary THR placeholder.

#### Scenario: Successful request
- **WHEN** a GET request is made to `/api/agenda/descriptivos?codigo_ine=43148`
- **THEN** the response SHALL contain a JSON object with `codigo_ine`, `nombre_municipio`, and an `indicadores` array of descriptive indicators that have at least one value for that municipality

#### Scenario: Each indicator has reference and current values
- **WHEN** the response includes an indicator
- **THEN** it SHALL contain `valor_referencia` and `periodo_referencia` (reference year or first available), and `valor_actual` and `periodo_actual` (requested year or last available)

### Requirement: codigo_ine parameter is required
The system SHALL require the `codigo_ine` query parameter and return an error if it is missing or invalid.

#### Scenario: Missing codigo_ine
- **WHEN** a GET request is made to `/api/agenda/descriptivos` without `codigo_ine`
- **THEN** the response SHALL be HTTP 400 with message indicating the missing parameter

#### Scenario: Invalid codigo_ine
- **WHEN** a GET request is made with a `codigo_ine` that does not exist in `REGIONES`
- **THEN** the response SHALL be HTTP 404 with message "Municipality not found"

### Requirement: Optional year parameters
The system SHALL support optional `year_reference` and `year` query parameters (integers). When omitted, reference value SHALL use the first available period for that indicator and municipality; current value SHALL use the last available period.

#### Scenario: Default reference and current periods
- **WHEN** a GET request omits both `year_reference` and `year` and an indicator has values for periods 2018 and 2022
- **THEN** the indicator SHALL have `valor_referencia` and `periodo_referencia` from 2018, and `valor_actual` and `periodo_actual` from 2022

#### Scenario: Explicit year_reference
- **WHEN** a GET request includes `year_reference=2020`
- **THEN** `valor_referencia` and `periodo_referencia` SHALL use the value for period 2020 if it exists; otherwise the first available period for that indicator and municipality

#### Scenario: Explicit year
- **WHEN** a GET request includes `year=2022`
- **THEN** `valor_actual` and `periodo_actual` SHALL use the value for period 2022 if it exists; otherwise the last available period for that indicator and municipality

### Requirement: Metadata includes aue1, nombre, unidad
Each indicator in the response SHALL include metadata: `aue1` (array of numbers 1–10 corresponding to AUE primary objectives from ARQUITECTURA_L2), `nombre` (from METADATA_ES), and `unidad` (from METADATA).

#### Scenario: AUE1 from ARQUITECTURA_L2
- **WHEN** an indicator is linked to `AUE-1` and `AUE-3` in ARQUITECTURA_L2
- **THEN** the indicator SHALL have `aue1` containing the corresponding objective numbers (e.g. [1, 3])

#### Scenario: Nombre and unidad from metadata
- **WHEN** an indicator has METADATA and METADATA_ES rows
- **THEN** the indicator SHALL include `nombre` and `unidad` from those tables

### Requirement: Temporary THR placeholder
Until the database has a THR column, the system SHALL return a synthetic `thr` field for each indicator. The value SHALL be one of `"1Q"`, `"2Q"`, `"3Q"`, `"4Q"` chosen in a deterministic or random way per request.

#### Scenario: THR present and in allowed set
- **WHEN** an indicator is included in the response
- **THEN** it SHALL contain `thr` with a value in the set `["1Q", "2Q", "3Q", "4Q"]`

### Requirement: Only descriptive indicators
The system SHALL return only indicators that have `tipo = 'descriptivo'` in METADATA and have at least one row in INDICADORES_DESCRIPTIVOS for the given municipality.

#### Scenario: No ODS or agenda indicators
- **WHEN** the response is built
- **THEN** only indicators with METADATA.tipo = 'descriptivo' SHALL appear in the list
