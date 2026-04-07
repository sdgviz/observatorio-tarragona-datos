## Why

Source CSVs under `diputacion_tarragona_data/dataset/` are the upstream truth for the SQLite DB that powers the Nuxt app APIs. Today we validate CSV structure via the data-repo integrity CLI, and the Nuxt repo only has small unit tests—nothing asserts that values ingested into the DB still match the CSVs users edit. Regressions in ETL or API mapping can slip through until someone spots wrong numbers in the UI.

## What Changes

- Add a **focused Vitest battery** in the Nuxt project (`test/nuxt/`) that:
  - Reads a **small fixed subset** of rows from selected CSVs in `diputacion_tarragona_data/dataset/` (configurable absolute path, defaulting via env or convention for the sibling checkout).
  - Invokes the **same server handlers** the app uses (e.g. `$fetch` against Nitro routes in test, or equivalent documented pattern) for:
    - per-municipio **indicator** values (`indicadores_agendas.csv` ↔ `/api/indicadores/valores`),
    - **ODS objective aggregates** (`promedios_municipio_ods_objetivo.csv` ↔ `/api/ods/promedios`).
  - Compares numeric fields with a **stable tolerance** (float-safe) and clear assertion messages (CSV row identity + API params + expected vs actual).
- Document how to run these tests in a **two-folder workspace** (data repo + app repo) and optional CI assumptions (DB rebuilt from current dataset).

## Capabilities

### New Capabilities

- `dataset-api-parity-tests`: Contract-style integration tests that tie canonical CSV samples to Nuxt API responses for indicators and ODS aggregates, living under `diputacion_tarragona/test/nuxt/`, with explicit subsets of municipios / indicators / objetivos ODS.

### Modified Capabilities

- _(none — no change to product API requirements; only adds automated verification.)_

## Impact

- **Nuxt repo** (`diputacion_tarragona`): new test files and possibly small test helpers, Vitest/Nuxt config tweaks (e.g. env for dataset path, test timeout if needed).
- **Data repo** (`diputacion_tarragona_data`): no runtime code change; tests **read** `dataset/*.csv` from a path outside the Nuxt package.
- **Developers / CI**: must have a **recent `server/dbfile/diputacion_tarragona.db`** built from the same dataset revision being compared, or tests are skipped/fail with an explicit message (behavior to be defined in design/spec).
