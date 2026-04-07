## ADDED Requirements

### Requirement: Dataset root configuration for parity tests

The Nuxt test suite SHALL resolve the directory containing upstream CSVs via `process.env.DATASET_ROOT` when set (absolute path). When `DATASET_ROOT` is unset, the suite MAY default to `../diputacion_tarragona_data/dataset` relative to the Nuxt project root for local development.

#### Scenario: CI provides absolute dataset path

- **WHEN** `DATASET_ROOT` is set to a directory that contains `indicadores_agendas.csv` and `promedios_municipio_ods_objetivo.csv`
- **THEN** parity tests SHALL read expected values from those files under that directory

#### Scenario: Dataset path unavailable

- **WHEN** the resolved dataset directory does not exist or required CSVs are missing
- **THEN** parity tests SHALL NOT fail with assertion errors on missing files; they SHALL be skipped or SHALL fail with a single explicit message that the dataset path is invalid (behavior MUST match the choice documented in `design.md` for the implementation)

### Requirement: Indicator values match CSV for sampled rows

For each configured sample tuple (indicator id, INE code, year), the test SHALL parse the matching row in `indicadores_agendas.csv` and SHALL call `GET /api/indicadores/valores` with `indicator_id`, `ine`, and `year` query parameters. The API response `valor` SHALL match the CSV `valor` within the documented numeric tolerance. If the CSV row includes a non-empty `indice` and the API returns `indice` for that query, the test SHALL also compare `indice` within the same tolerance.

#### Scenario: Single municipio-year-indicator parity

- **WHEN** a sample is defined for `codigo_ine` C, indicator I, and periodo Y and a row exists in `indicadores_agendas.csv` for (I, Y, C)
- **THEN** the response of `GET /api/indicadores/valores?indicator_id=I&ine=C&year=Y` SHALL have `valor` equal to the CSV value within tolerance

### Requirement: ODS objective aggregates match CSV for sampled rows

For each configured sample tuple (ODS objective number 1–17, INE code), the test SHALL parse the matching row in `promedios_municipio_ods_objetivo.csv` (same `codigo_ine` and `ods_objetivo` as the API `objetivo` query) and SHALL call `GET /api/ods/promedios?objetivo=`. The API row for that `codigo_ine` SHALL match CSV aggregate fields within tolerance after applying the column mapping implemented in the test helper (CSV `promedio_metas` to API `valor`, CSV `n_metas` to API `n_indicadores`).

#### Scenario: Promedio ODS objetivo parity per municipio

- **WHEN** a sample is defined for `codigo_ine` C and ODS objective O and a row exists in `promedios_municipio_ods_objetivo.csv` for (C, O)
- **THEN** the array returned by `GET /api/ods/promedios?objetivo=O` SHALL contain an entry for `codigo_ine` C whose `valor` and `n_indicadores` match the CSV within tolerance

### Requirement: Parity tests live under Nuxt test infrastructure

New parity tests SHALL reside under `diputacion_tarragona/test/nuxt/` (e.g. `datasetApiParity.test.ts`) and SHALL use the existing Vitest + `@nuxt/test-utils` project configuration. Shared parsing or comparison utilities MAY live alongside tests (e.g. `test/nuxt/helpers/`).

#### Scenario: Discoverable test entrypoint

- **WHEN** a developer runs `pnpm test:nuxt` from the Nuxt repository
- **THEN** the dataset–API parity tests are included in the run subject to dataset path and database preconditions

### Requirement: Explicit bounded sample set

The parity suite SHALL use an explicit, versioned list of samples (municipios, indicators with periodo, ODS objetivos) defined in code or a small fixture file in the Nuxt repo. The suite SHALL NOT require reading the entire CSV into memory for every assertion.

#### Scenario: Subset is documented in code

- **WHEN** a maintainer opens the parity test or fixture module
- **THEN** they SHALL see the full list of tuples under test and MAY extend it without changing production code
