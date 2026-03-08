## REMOVED Requirements

### Requirement: Create INDICADORES_ODS table
**Reason**: Unified into a single `INDICADORES` table. The separation by `clase` was redundant — indicator-to-agenda association is handled by `ARQUITECTURA_L2`.
**Migration**: Replace all references to `INDICADORES_ODS` with `INDICADORES`. Join with `METADATA` on `id_indicador` and filter by `tipo = 'ods'` if type-specific queries are needed.

### Requirement: Create INDICADORES_AGENDAS table
**Reason**: Unified into a single `INDICADORES` table. Same rationale as above.
**Migration**: Replace all references to `INDICADORES_AGENDAS` with `INDICADORES`. Join with `METADATA` on `id_indicador` and filter by `tipo = 'agenda'` if type-specific queries are needed.

## ADDED Requirements

### Requirement: Create INDICADORES table
The system SHALL create a single `INDICADORES` table with columns: `id_indicador` (TEXT, FK to METADATA), `codigo_ine` (TEXT, FK to REGIONES), `periodo` (INTEGER, NOT NULL), `valor` (REAL), `indice` (REAL), `categoria` (TEXT), `no_agregar` (TEXT), `texto` (TEXT). This table stores all non-descriptive indicator values regardless of their metadata `tipo`.

#### Scenario: Table created with correct schema
- **WHEN** the schema creation runs
- **THEN** the `INDICADORES` table exists with foreign keys to `METADATA(id_indicador)` and `REGIONES(codigo_ine)`

#### Scenario: No tipo column in INDICADORES
- **WHEN** the `INDICADORES` table is created
- **THEN** it SHALL NOT contain a `tipo` or `clase` column — the indicator type is available via `JOIN METADATA`

#### Scenario: Contains both ODS and agenda indicators
- **WHEN** data is loaded
- **THEN** `INDICADORES` contains rows for indicators with `METADATA.tipo = 'ods'` AND `METADATA.tipo = 'agenda'`

#### Scenario: Does not contain descriptive indicators
- **WHEN** data is loaded
- **THEN** `INDICADORES` SHALL NOT contain rows for indicators with `METADATA.tipo = 'descriptivo'` — those remain in `INDICADORES_DESCRIPTIVOS`
