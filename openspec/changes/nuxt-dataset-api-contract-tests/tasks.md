## 1. Discovery and fixtures

- [x] 1.1 Confirm ETL column mapping from `promedios_municipio_ods_objetivo.csv` to `PROMEDIOS_ODS` / `GET /api/ods/promedios` (and that `indicator_id` strings in API match `indicador` in `indicadores_agendas.csv`).
- [x] 1.2 Define a small fixed sample set: several `codigo_ine`, several `(indicador, periodo)` pairs that exist in CSV, several `ods_objetivo` values — as a TypeScript fixture module under `diputacion_tarragona/test/nuxt/`.

## 2. Test helpers

- [x] 2.1 Implement `resolveDatasetDir()` using `DATASET_ROOT` with sibling fallback `../diputacion_tarragona_data/dataset`, returning `null` when invalid.
- [x] 2.2 Implement CSV row lookup for `indicadores_agendas.csv` and `promedios_municipio_ods_objetivo.csv` (stream or read-once parse; keep test file small).
- [x] 2.3 Implement numeric comparison helper with documented absolute/relative tolerance.

## 3. Vitest parity tests (Nuxt)

- [x] 3.1 Add `test/nuxt/datasetApiParity.test.ts` (or equivalent name): guard with `describe`/`it` skip when dataset dir missing; otherwise run cases.
- [x] 3.2 For each indicator sample, run the same SQL as `GET /api/indicadores/valores` (single-value mode) and assert `valor` (and `indice` when applicable) vs CSV. *(Nuxt’s Vitest client env does not mount Nitro routes, so `$fetch` to `/api/*` is not used.)*
- [x] 3.3 For each ODS aggregate sample, run the same SQL as `GET /api/ods/promedios` for the municipio row and assert CSV-mapped fields.

## 4. Documentation and CI ergonomics

- [x] 4.1 Document in the Nuxt repo (short comment in test file or existing testing doc) how to run with two sibling folders and optional `DATASET_ROOT`.
- [x] 4.2 Run `pnpm test:nuxt` locally with dataset + DB present and fix any flakiness (timeouts, path resolution on macOS/Linux).
