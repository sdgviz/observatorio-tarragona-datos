## Why

The ODS goal page (`/ods/[objetivo]`) filters the map and beeswarm by `REGIONES.id_especial` and `id_poblacion`. Stakeholders need the same combinable filtering for **`id_especial2`**, which already exists on `REGIONES` but is not exposed in the UI or typed client contract, so users cannot slice the visualization by that dimension.

## What Changes

- Add a third **region** filter control for `id_especial2` on the ODS goal page, using the same `__all__` sentinel pattern as the existing `USelect` filters.
- Apply **AND** semantics: emphasized municipalities are the intersection of all active region filters (`id_especial`, `id_especial2`, `id_poblacion`) plus optional municipio selection, consistent with today’s behavior for the first two axes.
- Extend shared types and any list consumers so `id_especial2` is part of the municipality row shape returned by `GET /api/municipios/list` (already backed by `SELECT *` when the column exists).
- Add i18n labels for the new control in `ca` and `es`.
- Reset the new filter when the objective route param changes and when the user clears filters.

## Capabilities

### New Capabilities

_(none — behavior extends existing region-filter and list API capabilities.)_

### Modified Capabilities

- `ods-goal-region-filter-ui`: Add `id_especial2` as a combinable filter with the same emphasis/map/beeswarm behavior as the existing region selectors.
- `municipios-list-api`: Explicitly require `id_especial2` on each municipality object in list responses when the column exists in `REGIONES`, aligning the documented contract with the DB.

## Impact

- **App**: `app/pages/ods/[objetivo].vue` (state, computed filters, template grid, watchers, reset).
- **Types**: `app/types/municipios.ts` (`Municipio` interface).
- **i18n**: `i18n/locales/ca.json`, `i18n/locales/es.json` (new key alongside existing `odsPage.filterIdEspecial` / `filterIdPoblacion`).
- **Tests**: Dataset/API parity or contract tests that assert municipio list field shapes, if present.
- **No breaking API changes** for clients that ignore unknown fields; clients that validate shape must allow `id_especial2`.
