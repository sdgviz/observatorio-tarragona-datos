## Why

The municipio ODS page (`/municipios/ods/[ine]`) currently shows only the municipality name under "Ayuntamiento de". Users and stakeholders need quick context: population, comarca (from REGIONES), and a key indicator (indicator id 48, latest year) with its name and units, so they can understand the municipality at a glance without opening other views.

## What Changes

- Add a header-metadata block under the municipality name on `app/pages/municipios/ods/[ine].vue` showing:
  - **Población**: inhabitants count (from REGIONES or equivalent source).
  - **Comarca**: value of `id_especial` from REGIONES for that municipio (displayed as comarca identifier/label).
  - **Indicador 48**: value for the municipality for the latest available year, with the indicator's name and units (from METADATA / METADATA_ES).
- Introduce a backend endpoint that returns this header payload for a given `ine` (codigo_ine) so the page can fetch it in one call.
- Page continues to use existing CSV for basic municipio lookup (nombre, etc.); header metadata is loaded from the new API.

## Capabilities

### New Capabilities

- `municipio-header-api`: GET endpoint that returns for a given municipio (by codigo_ine): `poblacion`, `id_especial` (comarca), and the latest-year value for indicator id 48 plus its `nombre` and `unidad` from metadata. Single municipio, read-only, parameterized queries.
- `municipio-ods-header-ui`: Display of the above metadata in the municipio ODS page header (under the municipality name), with appropriate formatting and fallbacks when data is missing.

### Modified Capabilities

- None. Existing APIs (municipios list, indicador valores) are unchanged; the new endpoint is additive.

## Impact

- **Backend**: New API route under `server/api/` (e.g. `municipios/[ine]/header.get.ts` or similar) querying REGIONES and INDICADORES + METADATA (and METADATA_ES for nombre/unidad). Indicator id is fixed as 48; "latest year" is MAX(periodo) for that municipio and indicator.
- **Frontend**: `app/pages/municipios/ods/[ine].vue` will call the new endpoint (e.g. via `useFetch`) and render poblacion, comarca (id_especial), and indicador 48 (value, name, units, year) in the header section. Optional i18n keys for labels.
- **Data**: Relies on existing REGIONES (poblacion, id_especial), INDICADORES (valor, periodo for id_indicador = 8), and METADATA/METADATA_ES (nombre, unidad). No schema or ETL changes.
