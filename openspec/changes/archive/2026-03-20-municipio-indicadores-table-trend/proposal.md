## Why

The municipio indicadores "Lista" view only shows a single raw value per row and hides the normalized index (`indice`) that users need to compare indicators on a common scale. The dashboard already loads full time series for every visible indicator; keeping that fetch inside the dashboard duplicates work when the list could use the same data (e.g. trend first-vs-last year) and forces users to switch modes to see evolution context. Lifting time-series loading to the parent page shares one cache for Lista + Dashboard and enables a richer, table-oriented list without extra round-trips.

## What Changes

- Replace the flat list in Lista mode with a **data table** (Nuxt UI `UTable` or equivalent) showing at least: ODS, indicator name, **raw value** (`valor` + unit), **normalized value** (`indice` from hierarchy or aligned with latest period), and a **trend** column.
- **Trend column**: compare the **first** and **latest** year in the municipio time series returned by `/api/indicadores/valores` (ordered by `periodo`). Show a **green up** arrow when the indicator moved in the “better” direction, **red down** when “worse”, using the same direction semantics as elsewhere (respect `metadata.umbral_optimo` / `umbral_malo` or documented higher-is-better / lower-is-better rules).
- **Move** per-indicator time-series fetching and concurrency/cache from `IndicadoresDashboardView.vue` to the **parent** (`IndicadoresView.vue` or `pages/municipios/ods/[ine].vue` as appropriate): pass preloaded series into both `IndicadoresListView` and `IndicadoresDashboardView` so both modes reuse the same data.
- Loading/skeleton behavior: while series are loading, the table and dashboard show consistent loading states (no duplicate fetches when switching tabs).

## Capabilities

### New Capabilities

- `municipio-indicadores-table`: Table layout for Lista mode; columns for raw value, normalized index, and first-vs-latest trend arrows; accessibility and empty states for missing series or single-point series.

### Modified Capabilities

- `indicadores-dashboard-view`: Time-series fetching SHALL NOT live only inside `IndicadoresDashboardView`; the parent (or shared composable) SHALL own fetch + cache and pass data into the dashboard grid. Update the "Time-series data fetching for dashboard" requirement accordingly; preserve concurrency limits and reuse-on-filter behavior at the shared layer.

## Impact

- **Frontend** (`diputacion_tarragona`): `app/pages/municipios/ods/[ine].vue` (optional: if fetch is lifted to page level), `IndicadoresView.vue`, `IndicadoresListView.vue`, `IndicadoresDashboardView.vue`, possibly a new composable `useIndicadorValoresSeries` or similar; types for passed-in series.
- **API**: No change required if existing `/api/indicadores/valores` time-series responses are sufficient; confirm `indice` is available in hierarchy for “normalized” column or define whether normalized column uses hierarchy `indice` vs per-period normalized field from valores (implementation detail in design).
- **Docs/specs** (`diputacion_tarragona_data/openspec`): new spec under this change + delta for `indicadores-dashboard-view`.
