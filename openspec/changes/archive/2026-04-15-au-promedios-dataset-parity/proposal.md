## Why

Agenda Urbana map and pages use `GET /api/au/promedios`, backed by `PROMEDIOS_AGENDAS` and upstream `promedios_municipio_objetivo_aue.csv`. The Nuxt repo already runs CSV ↔ SQLite parity for ODS (`/api/ods/promedios` + `promedios_municipio_ods_objetivo.csv`) but **does not** verify AU promedios. Regressions in ETL or id_dict mapping (`AUE-{n}`) can go unnoticed until the UI shows wrong values.

## What Changes

- Extend the existing **Node Vitest `dataset-parity`** suite in `diputacion_tarragona` to add **AU promedio parity**: read `test/dataset/promedios_municipio_objetivo_aue.csv`, query SQLite with SQL aligned with `server/api/au/promedios.get.ts`, compare `valor`, `n_indicadores`, and `periodo` to CSV columns (`promedio_indice`, `n_indicadores`, `periodo_max`) within the same float/tolerance rules as ODS.
- Extend the **JSON report** (`dataset-parity-report.json` or shared helper) with an **`auePromedioTests`** (or equivalent) section documenting CSV values, equivalent `GET /api/au/promedios?objetivo=` query, and DB row fields.
- Ensure `test/dataset/` includes `promedios_municipio_objetivo_aue.csv` if not already present (committed copy, same sync policy as other parity CSVs).

## Capabilities

### New Capabilities

- `au-promedios-parity-tests`: Automated parity checks and report entries for AU municipal promedios vs `promedios_municipio_objetivo_aue.csv`, mirroring the ODS promedio parity pattern.

### Modified Capabilities

- _(none — product API behavior unchanged.)_

## Impact

- **Nuxt repo**: `test/nuxt/` helpers, fixtures, `datasetApiParity.integration.test.ts`, `writeParityReport.ts` (or successor), optional `parseDatasetCsv` / `parityDb` additions.
- **Data repo**: OpenSpec change only unless CSV column names or ETL contract change (not expected).
- **ETL** (`diputacion_tarragona_data`): already maps `objetivo_aue` → `id_dict` `AUE-${objetivo_aue}` into `PROMEDIOS_AGENDAS` (`promedio_indice` → `valor`, `periodo_max` → `periodo`); parity implementation must stay aligned with that transform.
