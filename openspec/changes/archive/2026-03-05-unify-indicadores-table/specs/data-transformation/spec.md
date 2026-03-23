## REMOVED Requirements

### Requirement: Route indicators by type
**Reason**: The routing logic that split indicators into `INDICADORES_ODS` and `INDICADORES_AGENDAS` by `clase` is no longer needed. All non-descriptive indicators go into a single `INDICADORES` table.
**Migration**: Replace `routeIndicadores()` with a function that maps all non-descriptive indicator rows into a single array for insertion into `INDICADORES`.

## ADDED Requirements

### Requirement: Map all non-descriptive indicators to INDICADORES
The system SHALL transform all indicator value rows from `indicadores_agendas.csv` whose `indicador` exists in metadata with `clase` of `"agendas"` or `"ods"` into rows for the unified `INDICADORES` table. Indicators with unknown `indicador` (not found in metadata) SHALL be skipped with a warning. Descriptive indicators are handled separately via `descriptivos.csv`.

#### Scenario: Agenda indicator mapping
- **WHEN** an indicator value row from `indicadores_agendas.csv` has an `indicador` whose metadata `clase` is `"agendas"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: ODS indicator mapping
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"ods"`
- **THEN** the row is inserted into `INDICADORES`

#### Scenario: Unknown indicator skipped
- **WHEN** an indicator value row references an `indicador` not found in metadata
- **THEN** the system SHALL log a warning and skip the row

#### Scenario: Descriptivo indicators excluded
- **WHEN** an indicator value row has an `indicador` whose metadata `clase` is `"descriptivo"`
- **THEN** the row is NOT inserted into `INDICADORES` (descriptivos come from a separate CSV and go to `INDICADORES_DESCRIPTIVOS`)

#### Scenario: Row count preserved
- **WHEN** the transform completes
- **THEN** the total number of rows in `INDICADORES` SHALL equal the sum of rows that previously went into `INDICADORES_ODS` plus `INDICADORES_AGENDAS`
