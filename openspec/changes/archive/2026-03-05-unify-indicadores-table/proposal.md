## Why

The database currently splits indicator values into two tables (`INDICADORES_ODS` and `INDICADORES_AGENDAS`) based on the `clase` field from metadata. This separation is artificial — indicators are not inherently "ODS" or "agendas"; their association to ODS objectives or AUE goals is already captured by `ARQUITECTURA_L2`. The split creates a concrete problem: an indicator like #54 (`clase=agendas`) is linked to ODS 5 and 8 via `ARQUITECTURA_L2`, but its values live in `INDICADORES_AGENDAS`, forcing any ODS-aware query to UNION both tables. Unifying them simplifies the data model, the transform pipeline, and enables clean hierarchical ODS queries.

## What Changes

- **BREAKING**: Replace `INDICADORES_ODS` and `INDICADORES_AGENDAS` tables with a single `INDICADORES` table using the same column schema (`id_indicador`, `codigo_ine`, `periodo`, `valor`, `indice`, `categoria`, `no_agregar`, `texto`).
- Remove the routing logic in the transform pipeline that splits indicators by `clase` — all non-descriptive indicators go to `INDICADORES`.
- Update the loader to insert into one table instead of two.
- Update the static viewer build script to query the unified table.
- `INDICADORES_DESCRIPTIVOS` remains unchanged (different schema with `umbral` column).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `schema-creation`: Replace two table definitions (`INDICADORES_ODS`, `INDICADORES_AGENDAS`) with a single `INDICADORES` table.
- `data-transformation`: Remove the `routeIndicadores` split by `clase`. All non-descriptive indicators are inserted into `INDICADORES` as a single stream.

## Impact

- **Schema** (`transform/src/schema/tables.ts`): Remove `CREATE_INDICADORES_ODS` and `CREATE_INDICADORES_AGENDAS`, add `CREATE_INDICADORES`.
- **Transform** (`transform/src/transform/indicadores.ts`): Simplify `routeIndicadores` — no longer splits by `clase`, returns one array.
- **Transform orchestration** (`transform/src/transform/index.ts`): Update types and flow to use single `indicadores` output.
- **Loader** (`transform/src/load/loader.ts`): Single `insertMany` call for `INDICADORES`.
- **Static viewer** (`transform/src/build-static-viewer.ts`): Replace two queries against `INDICADORES_ODS`/`INDICADORES_AGENDAS` with one query against `INDICADORES` joined with `METADATA` to distinguish ODS vs AUE indicators when needed.
- **OpenSpec specs** (`openspec/specs/schema-creation/spec.md`, `openspec/specs/data-transformation/spec.md`): Update requirement text.
- **No API impact**: The only DB-backed endpoint (`/api/ods/promedios`) queries `PROMEDIOS_ODS`, not the indicator tables directly.
- **No frontend impact**: No component queries these tables.
