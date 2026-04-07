# ods-api (delta)

## MODIFIED Requirements

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
