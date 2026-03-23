## Context

The transform pipeline reads `indicadores_agendas.csv` (which contains all non-descriptive indicator values) and splits them into two tables based on the `clase` metadata field: `INDICADORES_ODS` and `INDICADORES_AGENDAS`. Both tables have identical schemas. The association between indicators and ODS/AUE agendas is already captured by `ARQUITECTURA_L2` (a junction table linking `DICCIONARIO` entries to `METADATA` indicators). The `clase`-based split is redundant and makes cross-agenda queries unnecessarily complex.

No API endpoint currently queries `INDICADORES_ODS` or `INDICADORES_AGENDAS` directly — the only ODS endpoint (`/api/ods/promedios`) uses the pre-aggregated `PROMEDIOS_ODS` table. The static viewer build script (`build-static-viewer.ts`) is the only consumer that queries both tables separately.

## Goals / Non-Goals

**Goals:**
- Unify `INDICADORES_ODS` and `INDICADORES_AGENDAS` into a single `INDICADORES` table.
- Simplify the transform pipeline by removing the `clase`-based routing.
- Enable future endpoints to query all indicators from a single source.
- Keep `INDICADORES_DESCRIPTIVOS` separate (different schema).

**Non-Goals:**
- Changing the `METADATA.tipo` column or metadata structure — `tipo` still stores `'agenda'`, `'ods'`, `'descriptivo'` and can be used for filtering when needed.
- Building new API endpoints (that's a subsequent change).
- Modifying `PROMEDIOS_ODS` or `PROMEDIOS_AGENDAS` tables.
- Changing the CSV file format or parsing logic.

## Decisions

### 1. Table naming: `INDICADORES`

**Choice**: Name the unified table `INDICADORES` (not `INDICADORES_AGENDAS`).

**Rationale**: The old name `INDICADORES_AGENDAS` implies a subset. The new table holds all non-descriptive indicators regardless of class. A neutral name avoids confusion.

**Alternative considered**: Keep `INDICADORES_AGENDAS` to minimize text changes — rejected because it perpetuates the misleading name.

### 2. No `clase`/`tipo` column in `INDICADORES`

**Choice**: The unified table does NOT add a `clase` or `tipo` column. The indicator type is already available via `JOIN METADATA ON id_indicador` when needed.

**Rationale**: Adding a denormalized type column would duplicate data already in `METADATA.tipo`. Queries that need to filter by type can join `METADATA`. This keeps the schema normalized and avoids sync issues.

**Alternative considered**: Add a `tipo` column for convenience — rejected because the join is cheap (PK lookup) and no current consumer needs high-frequency filtering by type within this table.

### 3. Static viewer queries use METADATA join

**Choice**: `build-static-viewer.ts` currently runs two separate queries to build `odsByMun` and `auByMun` maps. After unification, it will query `INDICADORES` once and join with `ARQUITECTURA_L2` + `DICCIONARIO` to determine ODS vs AUE association, or join with `METADATA` to filter by `tipo`.

**Rationale**: Aligns with the new data model. The static viewer build is an offline process where query complexity is not a concern.

### 4. Transform pipeline simplification

**Choice**: Replace `routeIndicadores()` (which returns `{ agendas, ods, skipped }`) with a simpler function that returns `{ indicadores, skipped }` — a single array of all non-descriptive indicators.

**Rationale**: The routing logic was the only reason for the split. Without two target tables, there's no need to classify.

## Risks / Trade-offs

- **[Breaking change]** → The database schema changes. Any tool or script that directly queries `INDICADORES_ODS` or `INDICADORES_AGENDAS` will break. Mitigation: the impact analysis shows only the static viewer build script queries these tables, and it's part of the same codebase.
- **[Larger single table]** → `INDICADORES` will contain all rows that were previously split. Mitigation: SQLite handles this size trivially; the combined row count is the same as the original CSV.
- **[Spec drift]** → Existing openspec specs reference the two-table design. Mitigation: delta specs in this change update the requirements. Specs will be archived with the change.
