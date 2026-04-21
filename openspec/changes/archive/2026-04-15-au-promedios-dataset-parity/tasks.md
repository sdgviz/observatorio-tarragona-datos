## 1. Dataset and parsing

- [x] 1.1 Ensure `test/dataset/promedios_municipio_objetivo_aue.csv` exists in the Nuxt repo (copy from data pipeline output when refreshing snapshots).
- [x] 1.2 Add CSV loader + row finder for `promedios_municipio_objetivo_aue.csv` (columns: `codigo_ine`, `objetivo_aue`, `promedio_indice`, `n_indicadores`, `periodo_max`) in `test/nuxt/helpers/parseDatasetCsv.ts` or a dedicated helper.

## 2. DB parity query

- [x] 2.1 Add `selectPromedioAueForInePeriodo` (or similar) in `test/nuxt/helpers/parityDb.ts` with SQL aligned to `PROMEDIOS_AGENDAS` and `server/api/au/promedios.get.ts` filters (`id_dict = 'AUE-' + objetivo`, `codigo_ine`, `periodo`).

## 3. Fixtures and tests

- [x] 3.1 Extend `datasetApiParitySamples.ts` (or companion) with `parityAuePromedioSamples`: twenty `codigo_ine` values × three `objetivo_aue` values (`1`, `2`, `10`) present for all in the CSV.
- [x] 3.2 Add a `describe` block in `datasetApiParity.integration.test.ts` that runs assertions for each AU sample (valor, n_indicadores, periodo).

## 4. JSON report

- [x] 4.1 Extend `buildParityReport` / `writeParityReportJson` types and output to include `auePromedioTests` with CSV, `GET /api/au/promedios` query shape, `codigo_ine`, and DB fields.

## 5. Verification

- [x] 5.1 Run `pnpm exec vitest run --project dataset-parity` and confirm ODS + AU tests pass; confirm report contains the new section.
