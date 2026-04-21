## ADDED Requirements

### Requirement: AU promedio CSV ↔ PROMEDIOS_AGENDAS parity

The Nuxt `dataset-parity` Vitest project SHALL compare rows from `test/dataset/promedios_municipio_objetivo_aue.csv` to SQLite `PROMEDIOS_AGENDAS` using the same column semantics as ETL (`AUE-${objetivo_aue}`, `promedio_indice` → `valor`, `n_indicadores`, `periodo_max` → `periodo`).

#### Scenario: Municipio and objetivo slice

- **WHEN** a configured sample specifies `codigo_ine` C, `objetivo_aue` O, and a matching row exists in `promedios_municipio_objetivo_aue.csv`
- **THEN** the test SHALL load expected `promedio_indice`, `n_indicadores`, and `periodo_max` from that CSV row
- **AND** SHALL query the database for `id_dict = 'AUE-' + O`, `codigo_ine = C`, `periodo = periodo_max`
- **AND** SHALL assert `valor` and `n_indicadores` match within the same numeric tolerance policy as ODS promedio parity
- **AND** SHALL assert `periodo` equals `periodo_max`

### Requirement: Equivalent API query documented for AU promedios

Each AU promedio parity case SHALL be representable in the JSON report with the equivalent HTTP request shape `GET /api/au/promedios?objetivo=<O>` (integer 1–10), plus `codigo_ine` and DB fields under test.

#### Scenario: Report entry shape

- **WHEN** the parity report is written after the suite
- **THEN** the output JSON SHALL include an `auePromedioTests` array (or documented equivalent name) whose elements include CSV expectations, request path/query, `codigo_ine`, and DB values for that slice

### Requirement: Shared infrastructure with ODS parity

AU promedio parity SHALL run in the same Node Vitest project as existing ODS/indicador parity, reuse `test/dataset/` and the committed SQLite path policy, and SHALL NOT require a second Vitest project.

#### Scenario: Single command runs full parity

- **WHEN** a developer runs `pnpm exec vitest run --project dataset-parity` (or the project’s documented parity command)
- **THEN** ODS and AU promedio parity cases both execute subject to dataset and DB preconditions
