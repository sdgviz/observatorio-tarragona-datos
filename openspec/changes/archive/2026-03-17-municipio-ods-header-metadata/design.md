## Context

The municipio ODS page (`app/pages/municipios/ods/[ine].vue`) currently loads municipio from static CSV (`municipios_tarragona.csv`) and shows "Ayuntamiento de" + nombre. REGIONES in the DB already has `poblacion`, `id_especial` (comarca); INDICADORES has values per municipio/periodo/indicator; METADATA and METADATA_ES provide indicator name and unit. The app uses Nuxt 4, server API with SQLite (`useDatabase()`), and Nuxt UI. No new DB schema or ETL is required.

## Goals / Non-Goals

**Goals:**

- Expose a single GET endpoint that returns, for a given municipio (by codigo_ine): `poblacion`, `id_especial`, and the latest-year value for indicator id 48 plus its `nombre` and `unidad`.
- Render that metadata in the page header under the municipality name, with clear labels and fallbacks when fields are missing.

**Non-Goals:**

- Changing municipios list or indicador-valores APIs.
- Making indicator id 48 configurable or adding more indicators to the header.
- Adding comarca name resolution (e.g. id_especial → human label); display id_especial as-is unless a small lookup is already available.

## Decisions

1. **New endpoint: `GET /api/municipios/[ine]/header`**  
   Single route that returns header payload. Alternative: reuse `/api/municipios/list` and filter client-side, or call indicador-valores + METADATA separately; a dedicated header endpoint keeps the page to one request and keeps the contract explicit.

2. **Indicator id 48 as string**  
   Store and query as string (e.g. `"48"`) to match INDICADORES.id_indicador and METADATA.id_indicador.

3. **Latest year**  
   Resolve with `MAX(periodo)` for that municipio and indicator id 48 in INDICADORES; then join METADATA/METADATA_ES for nombre and unidad. If no row exists for indicator 48, return null/omit the indicador_48 block.

4. **Frontend data source**  
   Page keeps using CSV for nombre and basic lookup (and 404 if not found). Header metadata is loaded via `useFetch('/api/municipios/:ine/header')` so it is available for SSR when the API is called during render.

5. **Comarca display**  
   Use `id_especial` from REGIONES as the comarca value. If the codebase already has a comarca name table or CSV (e.g. nombre_comarca in CSV), the UI can optionally show that; otherwise show id_especial.

## Risks / Trade-offs

- **Missing data**: REGIONES may have null poblacion or id_especial; indicator 48 may be missing for some municipios. Mitigation: API returns nulls for missing fields; UI shows fallbacks (e.g. "—", hide block) and does not break.
- **Extra request**: One more API call per page load. Mitigation: Single lightweight query; acceptable for a single-municipio page.

## Migration Plan

- Add new server route; no DB migrations.
- Deploy backend; then deploy frontend that calls the new endpoint. If the endpoint is missing (e.g. old server), the page can catch the error and show header without metadata or a short “Datos no disponibles” message.
- Rollback: revert frontend to hide the metadata block; optional revert of the new API route.

## Open Questions

- Whether to resolve `id_especial` to a human-readable comarca name (e.g. from a dictionary or CSV column) in this change or a follow-up.
