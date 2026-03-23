## Why

The ODS goal page (`/ods/[objetivo]`) uses a single municipio selector to drive highlight state across every beeswarm and the map. That matches “pick one town” but not exploratory analysis: users need to **emphasize a subset** of municipalities defined by **REGIONES** attributes (`id_especial`, `id_poblacion`) while still optionally narrowing to one name—similar to the multi-dropdown “combination” pattern in the reference mock (region + range + municipality, full distribution visible with filtered points emphasized).

## What Changes

- **Filter UI on `app/pages/ods/[objetivo].vue`**: **Filter row** with `id_especial`, `id_poblacion`, and **municipio** (`USelect` + `USelectMenu`), sentinel value for “all” on region selects, AND logic, i18n. Selections **narrow the emphasized INE set**; beeswarms **keep all datapoints** (only visual emphasis/de-emphasis).
- **`BeeswarmChart.vue`**: Optional **`filterEmphasisInes`** — strong emphasis via **fill/opacity/stroke**; **radius stays data-driven** except hover. Precedence: hover > filter list > `highlights`. Backward compatible optional prop.
- **Map (`MapTarragona` / `MapWrapper`)**: **`emphasizedInes`** (multi-path stroke), **`disableSelectionZoom`**, **`fadeUnselected`** (dim fill outside emphasized set when opted in). ODS goal page enables fade + no selection zoom when the filter-derived set is non-empty.
- **Data**: Prefer reusing `GET /api/municipios/list` (already returns `REGIONES` rows with `id_especial`, `id_poblacion`) for client-side derivation of distinct values and filtering; optionally extend the list API with an `id_especial` filter query for consistency with existing `NMUN` (`id_poblacion`) if payload size is a concern.

## Capabilities

### New Capabilities

- `ods-goal-region-filter-ui`: Combined controls on the ODS goal page for `id_especial`, `id_poblacion`, and municipio; computes the set of `codigo_ine` to emphasize; clear/reset behaviour; i18n (ca/es).
- `beeswarm-filter-emphasis`: `BeeswarmChart` accepts a **list** of INEs for strong emphasis via fill/opacity/stroke (**radius stays data-driven** except hover), backward compatible.
- `map-multi-ine-highlight`: Map stack supports **multiple** INEs (stroke), **fade unselected** fill when requested, and **disabling selection zoom** (ODS goal page use case).

### Modified Capabilities

- `ods-goal-indicator-beeswarms`: Requirements updated so beeswarms on the ODS goal page use the region filter model (multi-INE emphasis + shared hover) instead of assuming a single municipio picker only.
- `municipios-list-api` (optional delta): If implementation adds server-side filtering by `id_especial` (mirror `NMUN` for `id_poblacion`), document new query parameter(s) and validation; if all logic stays client-side on the existing payload, **omit** this line at apply time.

## Impact

- **Frontend**: `[objetivo].vue`, `BeeswarmChart.vue`, `MapTarragona.vue`, `MapWrapper.vue`; possibly `server/api/municipios/list.get.ts` and types in `app/types/municipios.ts`.
- **No breaking changes** intended: new props optional; pages that do not pass them behave as today.
- **Reference**: Multi-filter + emphasized beeswarm points (saved mock `image-ef99d4cd-2cf9-450c-8261-c9864f803f3e.png`).
