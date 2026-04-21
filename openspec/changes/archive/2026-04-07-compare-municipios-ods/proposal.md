## Why

Stakeholders need to compare the municipality currently in view with up to two others on the same ODS indicators, both in the tabular list and in evolution charts, without leaving the page. Today the UI only reflects a single municipio, which makes benchmarking across territories slow and inconsistent with how comparisons are used in reporting.

## What Changes

- Add a searchable multi-select control ([Nuxt UI `USelectMenu`](https://ui.nuxt.com/raw/docs/components/select-menu.md) with `multiple`) to choose **up to two** additional municipios to compare with the current one (the route’s municipio remains primary).
- Persist the selected comparison municipios in **Pinia** so list view, dashboard/charts, and any future surfaces read the same selection.
- Use the **municipio catalog** for the picker (INE + display name); the app already exposes `GET /api/municipios/list` — extend or narrow that contract only if the current payload is unsuitable.
- Extend **`IndicadoresListView.vue`**: for each indicator row, keep the **primary** municipio layout as before; add **comparison** sub-rows in the same table row with **names only in the Indicador column** and **aligned** value rows (valor, año, índice, tendencia), loading compared data on demand.
- Extend **`IndicadoresDashboardView.vue`** and the **evolution chart** component(s): render the primary municipio as today and add **two extra series** — **municipio 1**: thick **dotted** line in one color; **municipio 2**: thick **dashed** line in another color — with a clear legend and accessible distinction (not color-only where feasible).

## Capabilities

### New Capabilities

- `municipio-comparison-state`: Pinia store for comparison INEs (max two), validation (exclude primary, dedupe), and helpers for consumers.
- `municipios-catalog-api`: HTTP API (or documented extension of an existing route) returning all municipios for the select menu (id + label, stable sort/search).
- `ods-indicadores-comparison-ui`: List and dashboard views consume comparison state, fetch compared municipio indicator/series data on demand, and present multi-municipio table columns and chart series with the specified line styles.

### Modified Capabilities

- _(None — no existing `openspec/specs/` baseline in this repo.)_

## Impact

- **App repo** (`diputacion_tarragona`): `app/stores/`, ODS indicadores page/parent components, `IndicadoresListView.vue`, `IndicadoresDashboardView.vue`, evolution card/chart component(s), `i18n` strings (ca/es), possible new `server/api` route or extension.
- **Data/transform**: only if the catalog cannot be derived from existing SQLite/static assets (prefer reusing existing municipio metadata).
- **Dependencies**: Nuxt UI `USelectMenu` (already in stack per project rules).
